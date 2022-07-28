var globalConst = require('globals.const');

var roleHarvester = {

    run: function(thisCreep) {
        if (thisCreep.memory.working == true && thisCreep.store.energy == 0) {
            // Keep harvesting until we have full energy
            thisCreep.memory.working = false;            
        }
        else if (thisCreep.memory.working == false && thisCreep.store.energy == thisCreep.store.getCapacity() ){
            // We have full energy so try refilling something
            thisCreep.memory.working = true;            
        }

        if(thisCreep.memory.working == true){

            // Find the closest Spawner/Extension/Tower that hasn't got full energy
            var refillStructures = thisCreep.room.find(FIND_MY_STRUCTURES);
            refillStructures = _.filter(refillStructures, function(thisStructure) {
                return (thisStructure.structureType == STRUCTURE_SPAWN || thisStructure.structureType == STRUCTURE_EXTENSION || thisStructure.structureType == STRUCTURE_TOWER)
                    && thisStructure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            });

            var closestRefillStructure = null;
            if (refillStructures.length > 0) {
                // Found a structure that needs refilling
                closestRefillStructure = refillStructures[0];
            };
            
            if(closestRefillStructure !== null) {                
                // Refill our selected structure
                var transferStructure = closestRefillStructure;	            
                thisCreep.say('🔋');                
            } else {
                // Fill contoller if there are no structures to fill
                var transferStructure = thisCreep.room.controller;
                thisCreep.say('💻');                
            }
            
            if(thisCreep.transfer(transferStructure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                // Move to the structure to refill
                thisCreep.moveTo(transferStructure);
                //thisCreep.say('🚓');
            }			
        }
        else {
            // See if there are any sources with containers next to them
            let myMiningPos = thisCreep.memory.miningPos;            
            let mySource = null;

            if (typeof myMiningPos === 'undefined' || (myMiningPos[0] == 0 && myMiningPos[1] == 0)) {
                console.log('Generating mining pos for: ' + thisCreep.name);
                // We have not saved our mining pos, so search for one and save it.
                let sourceContainers = thisCreep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.pos.findInRange(FIND_SOURCES, 1).length > 0});
    
                if (sourceContainers.length > 0) {
                    //console.log('Found source containers: ' + sourceContainers);
                    let foundDuplicate = false;
                    //let savePos = [-1, -1, thisCreep.room.name];                    
                    for (let checkSourceName in sourceContainers) {
                        foundDuplicate = false;
                        checkSource = sourceContainers[checkSourceName];
                        //console.log('Checking sourceid: ' + checkSource)                                                     
                        for (let name in Game.creeps) {                        
                            var checkCreep = Game.creeps[name];
                            
                            if (checkCreep.memory.role == globalConst.CREEP_HARVESTER_ROLE) {
                                let savePos = [-1, -1, thisCreep.room.name];
                                
                                if(typeof checkCreep.memory.miningPos !== 'undefined') {                                
                                    if(checkSource.pos.x == checkCreep.memory.miningPos.x && checkSource.pos.y == checkCreep.memory.miningPos.y) {
                                        foundDuplicate = true;
                                        //console.log('Found duplicate: ' + checkCreep.name + ', and ' + thisCreep.name);
                                        //console.log('x1: ' + checkSource.pos.x + ', x2: ' + checkCreep.memory.miningPos.x + ', y1: ' + checkSource.pos.y + ', y2: ' + checkCreep.memory.miningPos.y);

                                    }
                                }
                                                                
                            }                                
                        };
                        if(!foundDuplicate) {                                
                            console.log('Found mining spot for: ' + thisCreep.name + ', x: ' + checkSource.pos.x + ', y: ' + checkSource.pos.y);
                            thisCreep.memory.miningPos = checkSource.pos;
                            myMiningPos = checkSource.pos;
                            break; 
                        }   
                    }                    
                    
                    if(foundDuplicate) {
                        console.log('All containers are allocated for mining');
                    };
                } else {
                    // There are no containers 1 block from a mining source
                    console.log('No containers found next to sources for: ' + thisCreep.name);
                }

            }

            if(typeof myMiningPos !== 'undefined') {                
                if(thisCreep.pos.x == myMiningPos.x && thisCreep.pos.y == myMiningPos.y) {
                    //console.log('Reached container, starting mining: ' + thisCreep.name + ', to pos: ' + myMiningPos.x + ', ' + myMiningPos.y);
                    var source = thisCreep.pos.findClosestByPath(FIND_SOURCES);
                    thisCreep.harvest(source);
                    thisCreep.say('⛏️');
                } else {
                    //console.log('Moving miner: ' + thisCreep.name + ', to pos: ' + myMiningPos.x + ', ' + myMiningPos.y);
                    thisCreep.moveTo(myMiningPos.x, myMiningPos.y, null);
                    thisCreep.say('🚓');
                }
            }
		}
    },

    /** @param {Room} thisRoom */
    spawn: function(thisRoom) {
        let creepBody = globalConst.CREEP_HARVESTER_BODY;                   
        
        //var spawners = Game.spawns['Spawn1'];
        let spawners = thisRoom.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN}});
        spawners = _.filter(spawners, 'spawning', null);

        if (!spawners.length) {
            // No spawners, or all are already spawning a creep.
            return;        
        }
        
        var validSpawner = spawners[0];                   

        // Add extra body parts to the base creep until out of energy
        creepBody = globalConst.addParts(creepBody, thisRoom.energyAvailable, globalConst.CREEP_HARVESTER_BODY_EXTRA);

        let creepCost = globalConst.calcBodyCost(creepBody);
      
        // Generate unique name for the creep
        creepName = globalConst.generateUniqueName(globalConst.CREEP_HARVESTER_DESCRIP, creepBody, globalConst.CREEP_HARVESTER_ROLE, validSpawner);
      
        
        // Spawn the creep!
        if(creepName != '' && validSpawner.spawnCreep(creepBody, creepName,  { memory: {role: globalConst.CREEP_HARVESTER_ROLE, working: false}}) == OK) {
            console.log('Spawning creep: ' + creepName + ', parts: ' + creepBody);            
        } else {            
            if(thisRoom.energyAvailable >= creepCost) {
                console.log('Error calling spawnCreep for: ' + creepName + ', parts: ' + creepBody);
            }
        }       
    }
};

module.exports = roleHarvester;