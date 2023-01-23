import { customAlphabet } from "nanoid"
import { dutiesCollection, firestore, usersCollection } from "./firebase"
import { query, getDocs, where, orderBy, QuerySnapshot, Timestamp, setDoc, doc, getDoc, increment, writeBatch, QueryDocumentSnapshot, arrayUnion, arrayRemove } from "firebase/firestore"
import { classCollection } from "./firebase"
import { Duty, DutyDate, DutyType, User, UsersInClass } from "./types"
import { format } from "date-fns"
import { getUserAssignType } from "./helpers"

const genId = (() => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const id_size = 20

    return customAlphabet(alphabet, id_size)
})()

// ========= USER QUERIES ========== \\
// const addDutiesToUsers = async () => {
//     const usersQuery = query(usersCollection)
//     const user_ids = (await getDocs(usersQuery)).docs.map(d => d.data().netid)

//     const batch = writeBatch(firestore)

//     for (const netid of user_ids) {
//         const userRef = doc(usersCollection, netid)
//         batch.set(userRef, { duties: [] }, { merge: true })
//     }

//     await batch.commit()
// }

// const sanitizeUsers = async () => {
//     console.log('starting function')

//     const usersQuery = query(usersCollection)
//     const users = (await getDocs(usersQuery)).docs.map(d => d.data())

//     for (const user of users) {
//         if (!user.name || !user.netid || !user.email || !user.phone || user.inHouse === undefined) {
//             console.log(`${user.netid} | ${user.name} | is missing info`)
//         }

//         if (!user.credits || user.credits.waiter === undefined || !user.credits.social === undefined || !user.credits.cleaning === undefined) {
//             console.log(`${user.netid} | ${user.name} | is missing credits info`)
//         }

//         if (!user.class || !user.class.name || !user.class.semester) {
//             console.log(`${user.netid} | ${user.name} | is missing class info`)
//         }
//     }
// }

export const getAllNetids = async (): Promise<string[]> => {
    const q = query(usersCollection)
    const netids = (await getDocs(q)).docs.map(d => d.data().netid)

    return netids
}

export const getUserByNetid = async (netid: string): Promise<User | undefined> => {
    const userRef = doc(usersCollection, netid)
    const user = (await getDoc(userRef)).data()

    return user
}

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

export const isDutyExempt = (user: User, type: DutyType): boolean => {
    // return false

    // pres or vp
    if (user.position === 'President' || user.position === 'Vice President') return true
    // off campus
    if (user.offCampus) return true
    // exempt from duties of that type
    if (user.dutyExempt !== undefined && user.dutyExempt.type.indexOf(type) !== -1) return true
    // position assigns duties of type {type}
    if (getUserAssignType(user) === type) return true

    return false
}

export const getUsersByCredits = async (dutyType: DutyType): Promise<User[]> => {
    const usersQuery = query(usersCollection, orderBy(`credits.${dutyType}`, 'asc'))
    const users = (await getDocs(usersQuery)).docs.map(d => d.data())

    // filter out duty exempt users
    return users.filter(user => !isDutyExempt(user, dutyType))
}

// ============ DUTY QUERIES ============ \\
const dutySnapToDuties = (dutySnap: QuerySnapshot<Duty>): Duty[] => dutySnap.docs.map(duty => duty.data())
const dutyToObj = (duty: QueryDocumentSnapshot<Duty>): Duty => {
    const dutyData = duty.data()
    const time = dutyData.date.time as Timestamp
    const date = {
        day: dutyData.date.day,
        time: time.toDate()
    }

    return {
        ...duty.data(),
        date
    }
}
const dutyToJSON = (duty: QueryDocumentSnapshot<Duty>): string => JSON.stringify(dutyToObj(duty))

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

export const getDutiesByType = async (dutyType: DutyType, filterChecked?: boolean): Promise<Duty[]> => {
    let dutiesQuery = query(dutiesCollection, where('type', '==', dutyType), orderBy('date.time', 'asc'))
    // if (filterChecked) dutiesQuery = query(dutiesQuery, where('checked', '==', false))
    const duties = (await getDocs(dutiesQuery)).docs.map(dutyToObj)

    return duties
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

        batch.update(userRef, {
            [`credits.${type}`]: increment(assigned.credits[netid]),
            'duties': arrayUnion({ _id, type, day: dutyDate.day })
        })
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

    const type = duty.type

    const batch = writeBatch(firestore)

    // remove duty credits from all previously assigned
    for (const netid of duty.assigned) {
        const userRef = doc(usersCollection, netid)

        batch.update(userRef, {
            [`credits.${type}`]: increment(-duty.credits[netid]),
            'duties': arrayRemove({ _id, type, day: dutyDate.day })
        })
    }

    // add credits to everyone currently assigned
    for (const netid of assigned.assigned) {
        const userRef = doc(usersCollection, netid)

        batch.update(userRef, {
            [`credits.${type}`]: increment(assigned.credits[netid]),
            'duties': arrayUnion({ _id, type, day: dutyDate.day })
        })
    }

    batch.update(dutyRef, {
        name,
        date: dutyDate,
        ...assigned
    })

    await batch.commit()
}

export const deleteDuty = async (_id: string) => {
    const dutyRef = doc(dutiesCollection, _id)

    const duty = (await getDoc(dutyRef)).data()
    if (!duty) return

    const type = duty.type

    const batch = writeBatch(firestore)

    batch.delete(dutyRef)

    for (const netid of duty.assigned) {
        const userRef = doc(usersCollection, netid)

        batch.update(userRef, {
            [`credits.${type}`]: increment(-duty.credits[netid]),
            'duties': arrayRemove({ _id, type, day: duty.date.day })
        })
    }

    await batch.commit()
}

export const checkDuty = async (_id: string, checked: boolean) => {
    const dutyRef = doc(dutiesCollection, _id)
    return await setDoc(dutyRef, { checked }, { merge: true })
}

export const updateUserDutyCredits = async (_id: string, netid: string, credits: number) => {
    const dutyRef = doc(dutiesCollection, _id)
    const duty = (await getDoc(dutyRef)).data()

    if (!duty) throw Error('Duty does not exist.')

    const userRef = doc(usersCollection, netid)

    const batch = writeBatch(firestore)

    batch.update(dutyRef, `credits.${netid}`, credits)
    batch.update(userRef, `credits.${duty.type}`, increment(credits - duty.credits[netid]))

    await batch.commit()
}

// ============ MISC QUERIES ============ \\
// export const resetDB = async () => {
//     console.log("------ Start DB Reset... ------")
    
//     const usersQuery = query(usersCollection)
//     const users = (await getDocs(usersQuery)).docs

//     const batch = writeBatch(firestore)

//     for (const user of users) {
//         batch.update(user.ref, {
//             credits: {
//                 cleaning: 0,
//                 social: 0,
//                 waiter: 0
//             }
//         })
//     }

//     await batch.commit()

//     console.log("------ End DB Reset... ------")
// }

// export const exemptUsers = async () => {
//     console.log("------ Start Exempt... ------")
    
//     const usersQuery = query(usersCollection)
//     const users = (await getDocs(usersQuery)).docs

//     const netids = ["web89", "blf65", "dio6", "dp556", "mja256", "nj288", "occ22"]

//     const batch = writeBatch(firestore)

//     for (const user of users) {
//         let user_data = user.data()

//         if (netids.indexOf(user_data.netid) >= 0) {
//             batch.update(user.ref, {
//                 dutyExempt: {
//                     reason: "Second Semester Senior",
//                     type: [DutyType.waiter, DutyType.social, DutyType.cleaning]
//                 }
//             })
//         }
//     }

//     await batch.commit()

//     console.log("------ End Exempt... ------")
// }