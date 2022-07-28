
var globalConst = require('globals.const');

var roleHarvester = require('role.harvester');
var roleBuildRepair = require('role.buildrepair');
var roleHauler = require('role.hauler');
var roleUpgrader = require('role.upgrader');
var roleDefender = require('role.defender');


var actionsSpawnCreep = require('actions.spawncreep');
var actionsTowers = require('actions.towers');


var isFirstRun = true;

module.exports.loop = function () {	

	// Init our counter for unique creep names
	if(isFirstRun) {
		globalConst.run();
		isFirstRun = false;
	}

	// Clear memory for any dead creeps
	actionsSpawnCreep.clean();

	// Make our towers do stuff
	

	    
	// Spawn creeps in each room as needed
	for (let name in Game.rooms) {
		var thisRoom = Game.rooms[name];
		//console.log('Calling spawncreep.run: ' + name);

		actionsTowers.run(thisRoom);

		actionsSpawnCreep.run(thisRoom);
	}


	for (let name in Game.creeps) {
		var creep = Game.creeps[name];		

		if (creep.memory.role == globalConst.CREEP_DEFENDER_ROLE) {
			roleDefender.run(creep);			
		} else if (creep.memory.role == globalConst.CREEP_HARVESTER_ROLE) {
			roleHarvester.run(creep);			
		} else if (creep.memory.role == globalConst.CREEP_BUILDER_ROLE) {
			roleBuildRepair.run(creep);			
		} else if (creep.memory.role == globalConst.CREEP_UPGRADER_ROLE) {
			roleUpgrader.run(creep);			
		} else if (creep.memory.role == globalConst.CREEP_HAULER_ROLE) {
			roleHauler.run(creep);			
		} else {
			console.log('Unknown creep roll in main loop: ' + creep.memory.role);
		}
	}
}