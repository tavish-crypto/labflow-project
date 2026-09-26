import { futimes, stat } from "node:fs";
import { db } from "../../../db";
import tr from "zod/v4/locales/tr.js";
export async function getSampleStatusCounts(){
    const[
        totalSamples,
        receivedSamples,
        inProgressSamples,
        completedSamples,
        rejectedSamples,
    ] = await Promise.all([
        db.sample.count(),
        db.sample.count({
            where:{
                status: "RECEIVED",
            },
        }),
        db.sample.count({
            where:{
                status:"IN_PROGRESS",

            },
        }),
        db.sample.count({
             where: {
        status: "COMPLETED",
      },
        }),
        db.sample.count({
      where: {
        status: "REJECTED",
      },
    }),

    ])
    return {
    totalSamples,
    receivedSamples,
    inProgressSamples,
    completedSamples,
    rejectedSamples,
  };
}

export async function getExceptionCounts(){
    const[
        openExceptions,
        criticalExceptions,
    ]= await Promise.all([db.operationalException.count({
        where:{
            status:{
                in: ["OPEN","ACKNOWLEDGED"],
            },
        },
    }),
    db.operationalException.count({
        where:{
            severity:"CRITICAL",
            status:{
                in:["OPEN","ACKNOWLEDGED"],
            },
        },
    }),
    ])
    return{
        openExceptions,criticalExceptions,
    }    
}
export async function findSamplesForSlaMetrics(){
    return db.sample.findMany({
        select:{
            id:true,
            tests:{
                select:{
                    status:true,
                    dueAt:true,
                },
            },
        },
    });
    
}
