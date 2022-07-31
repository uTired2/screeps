var globalConst = require('globals.const');

var roleBuildRepair = {

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


            let saveStructures = buildStructures;

                    buildStructures = _.filter(buildStructures, function(thisStructure) {
                        return (thisStructure.structureType != STRUCTURE_RAMPART)});

                    if(buildStructures.length == 0) {

                    }




            // Check if there are any structures that need repairing 1st
            const repairStructures = thisCreep.room.find(FIND_STRUCTURES, {
                filter: checkStructure => checkStructure.hits < checkStructure.hitsMax && checkStructure.structureType != STRUCTURE_RAMPART});
            
            // This can cause creeps to bounce back and forwards between 2 structures, find a better way!
            //repairStructures.sort((a, b) => a.hits - b.hits);

            //console.log(repairStructures);

            if (repairStructures.length > 0) {           

                thisCreep.say('🚑');  
                repairResult = thisCreep.repair(repairStructures[0]);
                if (repairResult == ERR_NOT_IN_RANGE) {
                    thisCreep.moveTo(repairStructures[0]);
                } else if (repairResult != OK) {
                    console.log('Error occured trying to repair, name: ' + thisCreep.creepName + ', Error: ' + repairResult);
                }
            }
            else{
                // Repair Ramparts last and only to 50k health for the moment
                const repairStructures = thisCreep.room.find(FIND_STRUCTURES, {
                    filter: checkStructure => checkStructure.hits <= globalConst.RAMPART_MIN_HEALTH && checkStructure.structureType == STRUCTURE_RAMPART});
                if (repairStructures.length > 0) {
                    thisCreep.say('🚑');  
                    repairResult = thisCreep.repair(repairStructures[0]);
                    if (repairResult == ERR_NOT_IN_RANGE) {
                        thisCreep.moveTo(repairStructures[0]);
                    } else if (repairResult != OK) {
                        console.log('Error occured trying to repair rampart, name: ' + thisCreep.creepName + ', Error: ' + repairResult);
                    }
                } else {
                    // No structures need repairing, check if there is anything to build
                    var buildStructures = thisCreep.room.find(FIND_CONSTRUCTION_SITES);                

                    var closestConstructionSite = null;
                    if (buildStructures.length > 0) {
                        // Found a structure that needs building

                        buildStructures = thisCreep.pos.findClosestByPath(buildStructures);                                    
                        closestConstructionSite = buildStructures;
                    };
                    
                    if(closestConstructionSite !== null) {                
                        // Build our selected structure                
                        thisCreep.say('🔧');   
                        //console.log('Building')        ;
                        var buildResult = thisCreep.build(closestConstructionSite)
                        //console.log('Buildresult: ' + buildResult);
                        if(buildResult == ERR_NOT_IN_RANGE) {
                            // Move to the build site
                            thisCreep.moveTo(closestConstructionSite);
                            //console.log('Moving to construction site');
                            //thisCreep.say('🚓');
                        } else if (buildResult != OK) {
                            console.log('Error calling build for creep: ' + thisCreep.creepName + ', Error: ' + buildResult);
                        }
                    };
                };
            }
        }
        else {
            // Don't take all the energy from the container, otherwise we might not have any left for spawning
            let sourceContainer = thisCreep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= thisCreep.store.getCapacity() * 3});


            if(typeof sourceContainer !== 'undefined' && sourceContainer != null)
            {
                //var source = thisCreep.pos.findClosestByPath(FIND_SOURCES);
                thisCreep.say('⚡');

                if(thisCreep.withdraw(sourceContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // Move to our harvesting spot.
                    thisCreep.moveTo(sourceContainer);
                    //thisCreep.say('🚓');                
                }
            }
            else {
                // No sources found with enough energy
                thisCreep.say('🧭');
            }
		}    
    },

    /** @param {Room} thisRoom */
    spawn: function(thisRoom) {        
        let creepName = '';        
        let creepBody = globalConst.CREEP_BUILDER_BODY;                   
        
        //var spawners = Game.spawns['Spawn1'];
        let spawners = thisRoom.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN}});
        spawners = _.filter(spawners, 'spawning', null);

        if (!spawners.length) {
            // No spawners, or all are already spawning a creep.            
            return;        
        }
        
        var validSpawner = spawners[0];                   

        // Add extra body parts to the base creep until out of energy
        creepBody = globalConst.addParts(creepBody, thisRoom.energyAvailable, globalConst.CREEP_BUILDER_BODY_EXTRA);

        let creepCost = globalConst.calcBodyCost(creepBody);
      
        // Generate unique name for the creep
        creepName = globalConst.generateUniqueName(globalConst.CREEP_BUILDER_DESCRIP, creepBody, globalConst.CREEP_BUILDER_ROLE, validSpawner);
      
        
        // Spawn the creep!
        if(creepName != '' && validSpawner.spawnCreep(creepBody, creepName,  { memory: {role: globalConst.CREEP_BUILDER_ROLE, working: false}}) == OK) {
            console.log('Spawning creep: ' + creepName + ', parts: ' + creepBody);            
        } else {
            if(thisRoom.energyAvailable >= creepCost) {
                console.log('Error calling spawnCreep for: ' + creepName + ', parts: ' + creepBody);
            }
        }       
    }
};

module.exports = roleBuildRepair;