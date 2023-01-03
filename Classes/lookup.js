

var player1Lookup = [
    { row: 0, start: 0, end: 3 }, // 0: Idle
    { row: 0, start: 4, end: 7 }, // 1: Movement (Ground)
    { row: 1, start: 3, end: 4 }, // 2: Movement Up (Air)
    { row: 1, start: 5, end: 6 }, // 3: Movement Down (Air)
    { row: 2, start: 0, end: 4 }, // 4: Defeat
    { row: 5, start: 3, end: 9 }, // 5: Win
    { row: 7, start: 0, end: 4 }, // 6: Attack (Punch)
    { row: 8, start: 0, end: 3 }, // 7: Attack (Kick)
    { row: 1, start: 9, end: 9 }, // 8: Hit (Stunned)
];

var player2Lookup = [
    { row: 0, start: 0, end: 3 }, // 0: Idle
    { row: 0, start: 4, end: 7 }, // 1: Movement (Ground)
    { row: 1, start: 3, end: 4 }, // 2: Movement Up (Air)
    { row: 1, start: 5, end: 6 }, // 3: Movement Down (Air)
    { row: 2, start: 0, end: 4 }, // 4: Defeat
    { row: 6, start: 0, end: 5 }, // 5: Win
    { row: 7, start: 0, end: 4 }, // 6: Attack (Punch)
    { row: 8, start: 0, end: 3 }, // 7: Attack (Kick)
    { row: 1, start: 9, end: 9 }, // 8: Hit (Stunned)
];


var attackLookup = [
    { name: 'punch', damage: 5, cooldown: 200, button: { 1: 'S', 2: 'Down Arrow' } },
    { name: 'kick', damage: 10, cooldown: 200, button: { 1: 'Q', 2: 'Right Shift' } },
]