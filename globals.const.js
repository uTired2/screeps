
const globals = {
    
    run: function() {
        if (!Memory.myCreepNameCounter) Memory.myCreepNameCounter = 0;
    },

    /*
     BODYPART_COST: {
        "move": 50,
        "work": 100,
        "attack": 80,
        "carry": 50,
        "heal": 250,
        "ranged_attack": 150,
        "tough": 10,
        "claim": 600
    }
    */

    calcBodyCost: function(creepBody) {
        let totalCost = 0;
        for(let thisPart in creepBody) {
            //console.log('Part cost in loop: ' + BODYPART_COST[thisPart])
            totalCost += BODYPART_COST[creepBody[thisPart]];
        }
        //console.log('calcBodyCost returning: ' + totalCost + ', for Body: ' + creepBody);
        return totalCost;        
    },

    addParts: function(creepBody, energyAvailable, extraParts) {
        //let creepBody = globalConst.CREEP_HARVESTER_BODY;        
        let creepCost = globals.calcBodyCost(creepBody);
        let creepCurrentExtraPart = 0;

        //console.log('addParts creepBody: ' + creepBody + ', creepCost: ' + creepCost);
        //console.log('addParts 1st extra part: ' + extraParts[creepCurrentExtraPart] + ', extra cost: ' + BODYPART_COST[extraParts[creepCurrentExtraPart]]);


        while(creepCost + BODYPART_COST[extraParts[creepCurrentExtraPart]] <= energyAvailable) {
                
            console.log('Adding extra body part: ' + extraParts[creepCurrentExtraPart] + ', onto: ' + creepBody);

            // Add the part to our build
            creepBody.push(extraParts[creepCurrentExtraPart]);
            // Add the cost
            creepCost += BODYPART_COST[extraParts[creepCurrentExtraPart]];            

            // Loop back to the start of extra body parts once we reach the end
            creepCurrentExtraPart++;
            console.log('ExtraParts Len: ' + extraParts.length);
            if(creepCurrentExtraPart >= extraParts.length) {
                creepCurrentExtraPart = 0;
            }
        };
        return creepBody;    
    },

    generateUniqueName: function(creepName, creepBody, creepRole, thisSpawner) {
        var canCreate = OK;

        do {
            creepName = creepName + '_' + Memory.myCreepNameCounter;		
            canCreate = thisSpawner.spawnCreep(creepBody, creepName,  { memory: {role: creepRole, working: false}, dryRun: true});
            if(canCreate == ERR_NOT_ENOUGH_ENERGY) {
                // No longer have the required energy in this spawner, how rude!                    

            } else if(canCreate == ERR_BUSY) {
                // Already spawning a creep here, how rude!
            }
            else{                    
                Memory.myCreepNameCounter++;                    
            }
        } while (canCreate == ERR_NAME_EXISTS);

        if(canCreate != OK) {
            creepName = '';
        }
        return creepName;
    },

    // Maximum number of creeps to spawn of each type
    CREEP_HARVESTER_MAX: 3,
    CREEP_BUILDER_MAX: 2,
    CREEP_UPGRADER_MAX: 4,
    CREEP_HAULER_MAX: 4,
    CREEP_DEFENDER_MAX: 1,


    // Description used for naming creeps
    CREEP_HARVESTER_DESCRIP: 'HRV',
    CREEP_BUILDER_DESCRIP: 'BLD',
    CREEP_UPGRADER_DESCRIP: 'UPG',
    CREEP_HAULER_DESCRIP: 'HAU',
    CREEP_DEFENDER_DESCRIP: 'DEF',

    // Used for role memory for each creep
    CREEP_HARVESTER_ROLE: 'harvester',
    CREEP_BUILDER_ROLE: 'builder',
    CREEP_UPGRADER_ROLE: 'upgrade',
    CREEP_HAULER_ROLE: 'hauler',
    CREEP_DEFENDER_ROLE: 'defender',

    // Default starting body parts for each creep type, will be expanded based on available spawn energy
    CREEP_HARVESTER_BODY: [WORK, CARRY, CARRY, MOVE, MOVE],
    CREEP_BUILDER_BODY: [WORK, CARRY, CARRY, MOVE, MOVE],
    CREEP_UPGRADER_BODY: [WORK, CARRY, MOVE, MOVE],
    CREEP_HAULER_BODY: [CARRY,CARRY, CARRY, MOVE, MOVE,MOVE],
    CREEP_DEFENDER_BODY: [TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, MOVE, MOVE],
    
    // Additional part to add to each creep
    CREEP_HARVESTER_BODY_EXTRA: [MOVE, CARRY],
    CREEP_BUILDER_BODY_EXTRA: [MOVE, MOVE, WORK, MOVE, CARRY],
    CREEP_UPGRADER_BODY_EXTRA: [MOVE, CARRY, MOVE, MOVE, MOVE, WORK],
    CREEP_HAULER_BODY_EXTRA: [CARRY,MOVE],   
    CREEP_DEFENDER_BODY_EXTRA: [MOVE, ATTACK, TOUGH]

};

module.exports = globals;