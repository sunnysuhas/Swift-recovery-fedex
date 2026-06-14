import { getCase } from '../actions/cases';
import { getAuditLogs } from '../actions/audit-logs';
import { getDcas } from '../actions/dcas';

async function test() {
    console.log('Fetching Case...');
    const caseItem = await getCase('test_case_1767720552380');
    console.log('Case:', caseItem);

    console.log('Fetching Audit Logs...');
    const logs = await getAuditLogs('test_case_1767720552380');
    console.log('Logs:', logs);

    console.log('Fetching DCAs...');
    const dcas = await getDcas();
    console.log('DCAs Count:', dcas.length);

    if (caseItem && caseItem.assignedDCA) {
        const dcaFound = dcas.find(d => d.id === caseItem.assignedDCA);
        console.log('Matched DCA:', dcaFound);
    }
}

test().catch(console.error);
