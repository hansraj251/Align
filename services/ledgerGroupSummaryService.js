const ledgerGroupRepository =

    require("../repositories/ledgerGroupRepository");

const ledgerGroupMemberRepository =

    require("../repositories/ledgerGroupMemberRepository");

const ledgerGroupSummaryRepository =

    require("../repositories/ledgerGroupSummaryRepository");

function roundAmount(

    amount

) {

    return Math.round(

        (Number(amount) + Number.EPSILON) * 100

    ) / 100;

}

async function requireActiveMember(

    accountId,

    groupId

) {

    const member =

        await ledgerGroupMemberRepository

            .getByGroupAndAccount(

                groupId,

                accountId

            );

    if (

        !member ||

        member.status !== "active"

    ) {

        throw new Error(

            "Group not found"

        );

    }

    const group =

        await ledgerGroupRepository

            .getByMemberAccount(

                groupId,

                accountId

            );

    if (!group) {

        throw new Error(

            "Group not found"

        );

    }

    return {

        member,

        group

    };

}

function createMemberBalances(

    members

) {

    return members.map(

        (member) => ({

            member_id: member.id,

            account_id: member.account_id,

            name: member.name,

            mobile: member.mobile,

            email: member.email,

            role: member.role,

            total_paid: 0,

            total_share: 0,

            settlement_received: 0,

            settlement_paid: 0,

            net_balance: 0

        })

    );

}

async function getSummary(

    accountId,

    groupId

) {

    const access =

        await requireActiveMember(

            accountId,

            groupId

        );

    const members =

        await ledgerGroupSummaryRepository

            .getMembers(

                groupId

            );

    const expenses =

        await ledgerGroupSummaryRepository

            .getExpenses(

                groupId

            );

    const splits =

        await ledgerGroupSummaryRepository

            .getSplits(

                groupId

            );

    const payments =

        await ledgerGroupSummaryRepository

            .getPayments(

                groupId

            );

    const settlements =

        await ledgerGroupSummaryRepository

            .getSettlements(

                groupId

            );

    const balances =

        createMemberBalances(

            members

        );

    const balanceMap =

        new Map(

            balances.map(

                (member) => [

                    member.member_id,

                    member

                ]

            )

        );

    const expenseMap =

        new Map(

            expenses.map(

                (expense) => [

                    expense.id,

                    expense

                ]

            )

        );

    let totalExpenses = 0;

    for (

        const expense of expenses

    ) {

        totalExpenses +=

            Number(expense.amount);

    }

    for (

        const split of splits

    ) {

        const member =

            balanceMap.get(

                split.member_id

            );

        if (

            member &&

            expenseMap.has(

                split.expense_id

            )

        ) {

            member.total_share +=

                Number(split.share_amount);

        }

    }

    for (

        const payment of payments

    ) {

        const member =

            balanceMap.get(

                payment.member_id

            );

        if (

            member &&

            expenseMap.has(

                payment.expense_id

            )

        ) {

            member.total_paid +=

                Number(payment.amount);

        }

    }

    for (

        const member of balances

    ) {

        member.total_paid =

            roundAmount(

                member.total_paid

            );

        member.total_share =

            roundAmount(

                member.total_share

            );

        member.net_balance =

            roundAmount(

                member.total_paid -

                member.total_share

            );

    }

    for (

        const settlement of settlements

    ) {

        const payer =

            balanceMap.get(

                settlement.paid_by_member_id

            );

        const receiver =

            balanceMap.get(

                settlement.paid_to_member_id

            );

        const amount =

            Number(settlement.amount);

        if (payer) {

            payer.settlement_paid +=

                amount;

            payer.net_balance -=

                amount;

        }

        if (receiver) {

            receiver.settlement_received +=

                amount;

            receiver.net_balance +=

                amount;

        }

    }

    for (

        const member of balances

    ) {

        member.settlement_paid =

            roundAmount(

                member.settlement_paid

            );

        member.settlement_received =

            roundAmount(

                member.settlement_received

            );

        member.net_balance =

            roundAmount(

                member.net_balance

            );

    }

    const currentMember =

        balanceMap.get(

            access.member.id

        );

    const youWillGet =

        currentMember &&

        currentMember.net_balance > 0

            ? currentMember.net_balance

            : 0;

    const youWillPay =

        currentMember &&

        currentMember.net_balance < 0

            ? Math.abs(

                currentMember.net_balance

            )

            : 0;

    return {

        group: access.group,

        total_expenses:

            roundAmount(

                totalExpenses

            ),

        you_will_get:

            roundAmount(

                youWillGet

            ),

        you_will_pay:

            roundAmount(

                youWillPay

            ),

        members: balances,

        expenses,

        settlements

    };

}

module.exports = {

    getSummary

};
