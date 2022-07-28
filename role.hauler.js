var globalConst = require('globals.const');

var roleHauler = {   

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
        let sourceContainer = thisCreep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (s) => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] >= thisCreep.store.getCapacity()});


        //var source = thisCreep.pos.findClosestByPath(FIND_SOURCES);
        thisCreep.say('⚡');

        if(thisCreep.withdraw(sourceContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // Move to our harvesting spot.
            thisCreep.moveTo(sourceContainer);
            //thisCreep.say('🚓');                
        }
    }    
},

/** @param {Room} thisRoom */
spawn: function(thisRoom) {        
    let creepName = '';        
    let creepBody = globalConst.CREEP_HAULER_BODY;                   
    
    //var spawners = Game.spawns['Spawn1'];
    let spawners = thisRoom.find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_SPAWN}});
    spawners = _.filter(spawners, 'spawning', null);

    if (!spawners.length) {
        // No spawners, or all are already spawning a creep.            
        return;        
    }
    
    var validSpawner = spawners[0];                   

    // Add extra body parts to the base creep until out of energy
    creepBody = globalConst.addParts(creepBody, thisRoom.energyAvailable, globalConst.CREEP_HAULER_BODY_EXTRA);

    let creepCost = globalConst.calcBodyCost(creepBody);
  
    // Generate unique name for the creep
    creepName = globalConst.generateUniqueName(globalConst.CREEP_HAULER_DESCRIP, creepBody, globalConst.CREEP_HAULER_ROLE, validSpawner);
  
    //console.log('Attempting to spawn: ' + creepName + ', parts: ' + creepBody);            

    // Spawn the creep!
    if(creepName != '' && validSpawner.spawnCreep(creepBody, creepName,  { memory: {role: globalConst.CREEP_HAULER_ROLE, working: false}}) == OK) {
        console.log('Spawning creep: ' + creepName + ', parts: ' + creepBody);            
    } else {
        if(thisRoom.energyAvailable >= creepCost) {
            console.log('Error calling spawnCreep for: ' + creepName + ', parts: ' + creepBody);
        }
    }       
}
};

module.exports = roleHauler;