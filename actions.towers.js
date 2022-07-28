
var actionsTowers = {

    run: function(thisRoom) {

        var hostiles = thisRoom.find(FIND_HOSTILE_CREEPS);
        if(hostiles.length > 0) {

            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${thisRoom.roomName}`);
            var towers = thisRoom.find(
                FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            towers.forEach(tower => tower.attack(hostiles[0]));  
        } else {
            
            // Heal creeps
            let healingCreeps = false;
            for (let name in Game.creeps) {
                // get the creep object
                var creep = Game.creeps[name];
                if (creep.hits < creep.hitsMax) {
                    healingCreeps = true;
                    var towers = thisRoom.find(
                        FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                    towers.forEach(tower => tower.heal(creep));
                    console.log("Tower is healing Creep: " + creep.name);
                }
            } 
            let repairingStructures = false;
            if (!healingCreeps) {
                // repair/build                
                
                var towers = thisRoom.find(
                    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
                
                
                
                //if(thisTower.store[RESOURCE_ENERGY] > (thisTower.store.energyCapacity[RESOURCE_ENERGY] * 0.5)){
                    //Find the closest damaged Structure
                    var closestDamagedStructure = towers[0].pos.findClosestByRange(FIND_STRUCTURES, {filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL && s.structureType != STRUCTURE_RAMPART});
    	            if(closestDamagedStructure) {
                        repairingStructures = true;
    	 	            towers.forEach(thisTower => thisTower.repair(closestDamagedStructure));
    	 	            //console.log("The tower is repairing: " + closestDamagedStructure.id);
                    }
                //}
            }
            /*
            if (!repairingStructures) {                
                // Finally complete any construction                

                let towers = thisRoom.find(
                    FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});   
                    
                console.log('Found towers: ' + towers.length);
                //for(let thisTower in towers) {
                    thisTower = towers[0];
                    console.log('looping tower build, ' + thisTower.store[RESOURCE_ENERGY] + ', ' + thisTower.store.energyCapacity[RESOURCE_ENERGY]);

                    if(thisTower.energy > (thisTower.energyCapacity * 0.5)){
                        //Find the closest damaged Structure
                        var closestConstruction = thisTower.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
                        if(closestConstruction) {           
                            thisTower.build(closestConstruction)                                         
                            console.log("The tower is constructing: " + closestConstruction.name);
                        }
                    }
                //}
            }
            */

        }
    }
};

module.exports = actionsTowers;