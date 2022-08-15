import { customAlphabet } from "nanoid"
import { dutiesCollection, firestore, usersCollection } from "./firebase"
import { query, getDocs, where, orderBy, QuerySnapshot, addDoc, Timestamp, setDoc, doc, deleteDoc } from "firebase/firestore"
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

export const createDuty = async (type: DutyType, name: string, date: Date, assigned_users: User[]): Promise<{ error: any }> => {
    const dutyDate: DutyDate = {
        day: format(date, 'MM-dd-yyyy'),
        time: Timestamp.fromDate(date)
    }

    const assigned = usersToAssigned(assigned_users)

    try {
        const _id = genId()
        const dutyRef = doc(firestore, 'duties', _id)
        await setDoc(dutyRef, {
            _id, type, name,
            date: dutyDate,
            ...assigned
        })

        return { error: undefined }
    } catch (err) {
        console.log(err)
        return { error: err }
    }
}

export const updateDuty = async (_id: string, type: DutyType, name: string, date: Date, assigned_users: User[]) => {
    const dutyDate: DutyDate = {
        day: format(date, 'MM-dd-yyyy'),
        time: Timestamp.fromDate(date)
    }

    const assigned = usersToAssigned(assigned_users)

    try {
        const dutyRef = doc(firestore, 'duties', _id)
        await setDoc(dutyRef, {
            _id, type, name,
            date: dutyDate,
            ...assigned
        })

        return { error: undefined }
    } catch (err) {
        console.log(err)
        return { error: err }
    }
}

export const deleteDuty = async (id: string) => {
    const dutyRef = doc(firestore, 'duties', id)
    return await deleteDoc(dutyRef)
}