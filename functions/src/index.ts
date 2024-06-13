const functions = require('firebase-functions');
const admin = require('firebase-admin');
import { Timestamp } from 'firebase-admin/firestore';
admin.initializeApp();
const db = admin.firestore();

interface Test {
    id?: string;
    classId: string;
    createdBy: string;
    isForGroup: boolean;
    groupId?: string;
    testContent: any;
    dueDate: Timestamp;
    createdDate: Timestamp;
    isGraded: boolean;
}

interface Assignment {
    id?: string;
    title: string;
    description: string;
    classId: string;
    createdBy: string;
    isForGroup: boolean;
    groupId?: string;
    dueDate: Timestamp;
    createdDate: Timestamp;
    isGraded: boolean;
}

interface Member {
    email: string;
}

exports.scheduleEmailReminders = functions.pubsub.schedule('0 0 * * *').timeZone('UTC').onRun(async () => {
    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const startOfDay = new Date(oneDayFromNow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(oneDayFromNow.setHours(23, 59, 59, 999));

    const testsSnapshot = await db.collection('tests')
        .where('dueDate', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
        .where('dueDate', '<=', admin.firestore.Timestamp.fromDate(endOfDay))
        .get();

    const assignmentsSnapshot = await db.collection('assignments')
        .where('dueDate', '>=', admin.firestore.Timestamp.fromDate(startOfDay))
        .where('dueDate', '<=', admin.firestore.Timestamp.fromDate(endOfDay))
        .get();


    const tests: Test[] = testsSnapshot.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));
    const assignments: Assignment[] = assignmentsSnapshot.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));

    const emailPromises: any[] = [];

    for (const test of tests) {
        const classSnapshot = await db.collection('classes').doc(test.classId).get();
        const classData = classSnapshot.data();

        const memberSnapshots = await db.collection(`classes/${test.classId}/members`).get();
        memberSnapshots.forEach((member: { data: () => any; }) => {
            const memberData = member.data();
            const email = memberData.email;
            const message = {
                to: email,
                message: {
                    subject: `Reminder: Test Due Tomorrow`,
                    text: `Hello, \n\nThis is a reminder that a test in class "${classData.title}" is due tomorrow.`
                }
            };
            emailPromises.push(db.collection('mail').add(message));
        });
    }

    for (const assignment of assignments) {
        const classSnapshot = await db.collection('classes').doc(assignment.classId).get();
        const classData = classSnapshot.data();

        const memberSnapshots = await db.collection(`classes/${assignment.classId}/members`).get();
        memberSnapshots.forEach((member: { data: () => Member; }) => {
            const memberData = member.data() as Member;
            const email = memberData.email;
            const message = {
                to: email,
                message: {
                    subject: `Reminder: ${assignment.title} Assignment Due Tomorrow`,
                    text: `Hello, \n\nThis is a reminder that your assignment titled "${assignment.title}" in class "${classData.title}" is due tomorrow`
                }
            };
            emailPromises.push(db.collection('mail').add(message));
        });
    }

    await Promise.all(emailPromises);
    console.log('Email reminders scheduled');
});