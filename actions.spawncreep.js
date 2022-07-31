var globalConst = require('globals.const');

var roleHarvester = require('role.harvester');
var roleBuilder = require('role.buildrepair');
var roleHauler = require('role.hauler');


var actionsSpawnCreep = {
     
    /** @param {Room} thisRoom */
    run: function(thisRoom) {  

        if(typeof thisRoom !== 'undefined') {

            var harvesterCount = _.filter(Game.creeps, (findCreep) => findCreep.memory.role == globalConst.CREEP_HARVESTER_ROLE);                    
            //console.log('Checking ' + thisRoom.name + ' with harvester count of: ' + harvesterCount.length);
            if (harvesterCount.length == 0) {
                // Make sure we always have at least one harvester, builder and hauler
                globalConst.sendNotifyMsg('** EMERGENCY ** No harvesters found in room: ' + thisRoom.roomName + ' ** EMERGENCY ** ');
                                
                roleHarvester.spawn(thisRoom);
                return;
            } else if (harvesterCount.length < globalConst.CREEP_HARVESTER_MAX) {
                //console.log('Spawning harvester');
                roleHarvester.spawn(thisRoom);
            }

            var haulerCount = _.filter(Game.creeps, (findCreep) => findCreep.memory.role == globalConst.CREEP_HAULER_ROLE);                    
            //console.log('Checking ' + thisRoom.name + ' with harvester count of: ' + harvesterCount.length);
            if(haulerCount == 0) {
                // Make sure we always have at least one harvester, builder and hauler
                globalConst.sendNotifyMsg('** EMERGENCY ** No haulers found in room: ' + thisRoom.roomName + ' ** EMERGENCY ** ');                
                roleHauler.spawn(thisRoom);
                return;

            } else if (haulerCount.length < globalConst.CREEP_HAULER_MAX) {                            
                roleHauler.spawn(thisRoom);
            }            

            var builderCount = _.filter(Game.creeps, (findCreep) => findCreep.memory.role == globalConst.CREEP_BUILDER_ROLE);                    
            //console.log('Checking ' + thisRoom.name + ' with harvester count of: ' + harvesterCount.length);
            if(builderCount == 0) {                
                globalConst.sendNotifyMsg( '** EMERGENCY ** No builders found in room: ' + thisRoom.roomName + ' ** EMERGENCY ** ');
                roleBuilder.spawn(thisRoom);
                return;
            } else if (builderCount.length < globalConst.CREEP_BUILDER_MAX) {                
                roleBuilder.spawn(thisRoom);
            }            
        }
        else {
            console.log('thisRoom is undefined');
        }
    },

    // Clear memory for any dead creeps
    clean: function() {
        if (Object.keys(Memory.creeps).length > Object.keys(Game.creeps).length) {
            for(var thisCreep in Memory.creeps) {
                if(!Game.creeps[thisCreep]) {
                    delete Memory.creeps[thisCreep];
                }
            }
        }
    }    
};

module.exports = actionsSpawnCreep;