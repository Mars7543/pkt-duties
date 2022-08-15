import { customAlphabet } from "nanoid"
import { dutiesCollection, firestore, usersCollection } from "./firebase"
import { query, getDocs, where, orderBy, QuerySnapshot, Timestamp, setDoc, doc, deleteDoc, getDoc, increment, writeBatch, QueryDocumentSnapshot } from "firebase/firestore"
import { classCollection } from "./firebase"
import { Duty, DutyDate, DutyType, User, UsersInClass } from "./types"
import { format } from "date-fns"

const genId = (() => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const id_size = 20

    return customAlphabet(alphabet, id_size)
})()

// ========= USER QUERIES ========== \\
export const getUsersByClass = async (): Promise<UsersInClass[]> => {
    const classesQuery = query(classCollection, orderBy('index', 'asc'))
    const classes = (await getDocs(classesQuery)).docs.map(d => d.data())

    const usersByClass = classes.map(async c => {
        let q = query(usersCollection, where('class.name', '==', c.class))
        if (c.fallClass) q = query(q, where('class.semester', '==', 'Fall'))

        const users = (await getDocs(q)).docs.map(d => d.data())
        return {
            class: c,
            users
        }
    })

    return await Promise.all(usersByClass)
}

export const getUsersByCredits = async (dutyType: DutyType): Promise<User[]> => {
    const usersQuery = query(usersCollection, orderBy(`credits.${dutyType}`, 'asc'))
    const users = (await getDocs(usersQuery)).docs.map(d => d.data())

    return users
}

// ============ DUTY QUERIES ============ \\
const dutySnapToDuties = (dutySnap: QuerySnapshot<Duty>): Duty[] => dutySnap.docs.map(duty => duty.data())
const dutyToJSON = (duty: QueryDocumentSnapshot<Duty>): string => {
    const dutyData = duty.data()
    const time = dutyData.date.time as Timestamp
    const date = {
        day: dutyData.date.day,
        time: time.toDate()
    }

    return JSON.stringify({
        ...duty.data(),
        date
    })
}

export const getDutiesByUser = async (netid: string): Promise<{ error: any, user?: User, duties?: Record<DutyType, string[]> }> => {
    try {
        const user = (await getDoc(doc(usersCollection, netid))).data()
        if (!user) return { error: 404, user: undefined, duties: undefined }

        const waiterQuery = query(dutiesCollection, where('type', '==', 'waiter'), where('assigned', "array-contains", netid), orderBy('date.time', 'asc'))
        const waiterDuties = (await getDocs(waiterQuery)).docs.map(dutyToJSON)

        const cleaningQuery = query(dutiesCollection, where('type', '==', 'cleaning'), where('assigned', "array-contains", netid), orderBy('date.time', 'asc'))
        const cleaningDuties = (await getDocs(cleaningQuery)).docs.map(dutyToJSON)

        const socialQuery = query(dutiesCollection, where('type', '==', 'social'), where('assigned', "array-contains", netid), orderBy('date.time', 'asc'))
        const socialDuties = (await getDocs(socialQuery)).docs.map(dutyToJSON)

        return {
            error: undefined,
            user,
            duties: {
                waiter: waiterDuties,
                cleaning: cleaningDuties,
                social: socialDuties
            }
        }
    } catch (err) {
        console.log(err)
        return { error: err, user: undefined, duties: undefined }
    }
}

export const getDutiesByDays = async (dutyType: DutyType, days: Date[]): Promise<Duty[][]> => {
    const dutiesSnaps = days.map(day => {
        const formattedDay = format(day, 'MM-dd-yyyy')
        const q = query(dutiesCollection, where('type', '==', dutyType), where('date.day', '==', formattedDay), orderBy('name', 'asc'))
        return getDocs(q)
    })

    const duties = (await Promise.all(dutiesSnaps)).map(dutySnapToDuties)

    return duties
}

const usersToAssigned = (users: User[]): {
    assigned: string[],
    assigned_names: { [index: string]: string },
    credits: { [index: string]: number }
} => {
    let assigned: string[] = []
    let assigned_names: { [index: string]: string } = {}
    let credits: { [index: string]: number } = {}

    users.forEach((user) => {
        assigned.push(user.netid)
        assigned_names[user.netid] = user.name
        credits[user.netid] = 1
    })

    return { assigned, assigned_names, credits }
}

export const createDuty = async (type: DutyType, name: string, date: Date, assigned_users: User[]) => {
    const _id = genId()
    const dutyRef = doc(dutiesCollection, _id)
    const dutyDate: DutyDate = {
        day: format(date, 'MM-dd-yyyy'),
        time: Timestamp.fromDate(date)
    }
    const assigned = usersToAssigned(assigned_users)

    const batch = writeBatch(firestore)

    batch.set(dutyRef, {
        _id, type, name,
        date: dutyDate,
        ...assigned
    })

    for (const netid of assigned.assigned) {
        const userRef = doc(usersCollection, netid)
        batch.update(userRef, `credits.${type}`, increment(assigned.credits[netid]))
    }

    await batch.commit()
}

export const updateDuty = async (_id: string, name: string, date: Date, assigned_users: User[]) => {
    const dutyRef = doc(dutiesCollection, _id)
    const duty = (await getDoc(dutyRef)).data()
    const dutyDate: DutyDate = {
        day: format(date, 'MM-dd-yyyy'),
        time: Timestamp.fromDate(date)
    }
    const assigned = usersToAssigned(assigned_users)

    if (!duty) return

    const batch = writeBatch(firestore)

    // remove duty credits from all previously assigned
    for (const netid of duty.assigned) {
        batch.update(doc(usersCollection, netid), `credits.${duty.type}`, increment(-duty.credits[netid]))
    }

    // add credits to everyone currently assigned
    for (const netid of assigned.assigned) {
        batch.update(doc(usersCollection, netid), `credits.${duty.type}`, increment(assigned.credits[netid]))
    }

    batch.update(dutyRef, {
        name,
        date: dutyDate,
        ...assigned
    })

    await batch.commit()
}

export const deleteDuty = async (id: string) => {
    const dutyRef = doc(dutiesCollection, id)

    const duty = (await getDoc(dutyRef)).data()
    if (!duty) return

    const batch = writeBatch(firestore)

    batch.delete(dutyRef)

    for (const netid of duty.assigned) {
        batch.update(doc(usersCollection, netid), `credits.${duty.type}`, increment(-duty.credits[netid]))
    }

    await batch.commit()
}