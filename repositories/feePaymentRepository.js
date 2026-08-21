const db =
    require("../db");

exports.getById =
async (
    schoolId,
    paymentId
) => {

    return await db.getAsync(
        `
        SELECT *
        FROM fee_payments
        WHERE id = ?
        AND school_id = ?
        `,
        [
            paymentId,
            schoolId
        ]
    );

};

exports.getByStudent =
async (
    schoolId,
    studentId,
    academicYear
) => {

    return await db.allAsync(
        `
        SELECT *
        FROM fee_payments
        WHERE school_id = ?
        AND student_id = ?
        AND academic_year = ?
        ORDER BY
            payment_date DESC,
            id DESC
        `,
        [
            schoolId,
            studentId,
            academicYear
        ]
    );

};

exports.getTotalPaidByStudent =
async (
    schoolId,
    studentId,
    academicYear
) => {

    return await db.getAsync(
        `
        SELECT
            COALESCE(
                SUM(amount),
                0
            ) AS total_paid
        FROM fee_payments
        WHERE school_id = ?
        AND student_id = ?
        AND academic_year = ?
        `,
        [
            schoolId,
            studentId,
            academicYear
        ]
    );

};

exports.getAllBySchool =
async (
    schoolId,
    academicYear
) => {

    return await db.allAsync(
        `
        SELECT
            fee_payments.*,

            students.admission_no,

            students.name AS student_name,

            students.class_name,

            students.section

        FROM fee_payments

        INNER JOIN students
            ON students.id =
                fee_payments.student_id

        WHERE fee_payments.school_id = ?

        AND fee_payments.academic_year = ?

        AND students.school_id = ?

        ORDER BY
            fee_payments.payment_date DESC,
            fee_payments.id DESC
        `,
        [
            schoolId,
            academicYear,
            schoolId
        ]
    );

};

exports.create =
async (
    data
) => {

    const result =
        await db.runAsync(
            `
            INSERT INTO fee_payments
            (
                school_id,
                student_id,
                academic_year,
                amount,
                payment_date,
                payment_mode,
                receipt_no,
                remarks
            )
            VALUES
            (
                ?, ?, ?, ?, ?, ?, ?, ?
            )
            `,
            [
                data.schoolId,
                data.studentId,
                data.academicYear,
                data.amount,
                data.paymentDate,
                data.paymentMode,
                data.receiptNo,
                data.remarks
            ]
        );

    return await exports.getById(
        data.schoolId,
        result.lastID
    );

};