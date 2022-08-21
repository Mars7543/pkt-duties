const functions = require('firebase-functions')
const admin = require('firebase-admin')
const serviceAccount = require('./admin-config.json')
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

exports.dutyCreated = functions.firestore
    .document('duties/{dutyID}')
    .onCreate(async (snapshot, context) => {
        // ======= TWILIO SETUP ======== \\
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const messagingServiceSid = process.env.TWILIO_MESSAGING_SID

        const twilio = require('twilio')(accountSid, authToken)
        const format = require('date-fns/format')

        // Notify Users
        const duty = snapshot.data()
        const assigned = duty.assigned

        try {
            for (const netid of assigned) {
                const user = (
                    await admin.firestore().collection('users').doc(netid).get()
                ).data()

                if (!user) return

                const phone = `+1${user.phone}`
                const msg = `Hi ${
                    user.name.split(' ')[0]
                }, you have been assigned to "${duty.name}" on ${format(
                    duty.date.time.toDate(),
                    'EEEE, MMMM do'
                )}`

                const message = twilio.messages.create({
                    to: phone,
                    body: msg,
                    messagingServiceSid
                })

                console.log(message)
            }
        } catch (err) {
            console.log('Error notifying users on duty creation.')
            console.log(err)
        }

        return
    })

exports.dutyUpdated = functions.firestore
    .document('duties/${dutyID}')
    .onUpdate(async (snapshot, context) => {
        // ======= TWILIO SETUP ======== \\
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const messagingServiceSid = process.env.TWILIO_MESSAGING_SID

        const twilio = require('twilio')(accountSid, authToken)
        const format = require('date-fns/format')

        // Notify Users
        const duty = snapshot.data()
        const assigned = duty.assigned

        try {
            for (const netid of assigned) {
                const user = (
                    await admin.firestore().collection('users').doc(netid).get()
                ).data()

                if (!user) return

                const phone = `+1${user.phone}`
                const msg = `Hi ${
                    user.name.split(' ')[0]
                }, you have been unassigned to "${duty.name}" on ${format(
                    duty.date.time.toDate(),
                    'EEEE, MMMM do'
                )}`

                const message = twilio.messages.create({
                    to: phone,
                    body: msg,
                    messagingServiceSid
                })

                console.log(message)
            }
        } catch (err) {
            console.log('Error notifying users on duty creation.')
            console.log(err)
        }

        return
    })

exports.dutyDeleted = functions.firestore
    .document('duties/{dutyID}')
    .onDelete(async (snapshot, context) => {
        // ======= TWILIO SETUP ======== \\
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const messagingServiceSid = process.env.TWILIO_MESSAGING_SID

        const twilio = require('twilio')(accountSid, authToken)
        const format = require('date-fns/format')

        // Notify Users
        const duty = snapshot.data()
        const assigned = duty.assigned

        try {
            for (const netid of assigned) {
                const user = (
                    await admin.firestore().collection('users').doc(netid).get()
                ).data()

                if (!user) return

                const phone = `+1${user.phone}`
                const msg = `Hi ${
                    user.name.split(' ')[0]
                }, you have been unassigned to "${duty.name}" on ${format(
                    duty.date.time.toDate(),
                    'EEEE, MMMM do'
                )}`

                const message = twilio.messages.create({
                    to: phone,
                    body: msg,
                    messagingServiceSid
                })

                console.log(message)
            }
        } catch (err) {
            console.log('Error notifying users on duty creation.')
            console.log(err)
        }

        return
    })

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
