import { getSampleStatusCounts,getExceptionCounts,findSamplesForSlaMetrics } from "./dashboard.repository"; 
import { calculateSlaStatus,calculateOverallSlaStatus } from "../sample.sla";
import test from "node:test";
export async function getDashboardSummmary(){
const[sampleCounts,exceptionCounts,samples,]= await Promise.all([
    getSampleStatusCounts(),getExceptionCounts(),findSamplesForSlaMetrics()
])  
let slaAtRisk = 0;
let slaBreached = 0;
for (const sample of samples){
    const testWithSla = sample.tests.map((test)=>{
        const sla = calculateSlaStatus(
            test.dueAt,
            test.status
        )
        return{
            ...test,
            ...sla,
        }
    })
    const overallSlaStatus = calculateOverallSlaStatus(testWithSla);
    if(overallSlaStatus === "AT_RISK"){
        slaAtRisk++;
    }
    if(overallSlaStatus === "BREACHED"){
        slaBreached++
    }
}
return{
    ...sampleCounts,
    ...exceptionCounts,
    slaAtRisk,
    slaBreached,
}
}