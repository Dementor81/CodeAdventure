"use strict";
const BAHNHOF = 1;
const STRECKE = 2;
const HALTEPUNKT = 2;
const MIN_STANDZEIT = 30;

var railway, trains, timetables;

$(() => {
    $(btnReset).click(reset);
    $(btnStart).click(runTrains);

    reset();
});

function reset() {
    railway = createRailway();
    timetables = createTimeTables();
    trains = createTrains();
}

function createRailway() {
    let r = [
        {
            id: "MWO",
            type: BAHNHOF,
            name: "Wolfratshausen",
            tracks: 2,
        },
        {
            id: 1,
            type: STRECKE,
            sections: [
                { length: 0.2, speed: 50 }, //26,1
                { length: 0.7, speed: 70 }, //25,9
                { length: 0.2, speed: 60 }, //25,2
                { length: 0.9, speed: 80 }, //25,0
                { length: 0.7, speed: 70 }, //24,1
                { length: 0.7, speed: 60 }, //23,4
                { length: 0.7, speed: 80 }, //22,7
            ],
        },
        {
            id: "MIC",
            type: BAHNHOF,
            name: "Icking",
            tracks: 2,
        },
        {
            id: 3,
            type: STRECKE,
            sections: [
                { length: 1.3, speed: 100 }, //21,3
                { length: 1.2, speed: 80 },
            ],
        },
        {
            id: "MEBS",
            type: BAHNHOF,
            name: "Ebenh.-Schäftl.",
            tracks: 2,
        },
        {
            id: 4,
            type: STRECKE,
            sections: [
                { length: 1.5, speed: 70 }, //26,1
                { length: 0.1, speed: 80 }, //25,9
            ],
        },{
            id: "MHSL",
            type: HALTEPUNKT,
            name: "Hohenschäftl. HP",
        },{
            id: 4,
            type: STRECKE,
            sections: [
                { length: 1.5, speed: 80 }, //26,1
                { length: 0.1, speed: 80 }, //25,9
            ],
        },
    ];

    r.forEach((bs, i) => {
        if (i != 0) bs.prev = r[i - 1];
        if (i < r.length - 1) bs.next = r[i + 1];
        bs.trains = [];

        if (bs.sections) {
            bs.length = bs.sections.reduce((length, s) => (length += s.length), 0);
        }
    });

    return r;
}

function getRilwayIndexById(id) {
    return railway.findIndex((item) => item.id === id);
}

function ConvertHumanToSeconds(human) {
    const [hours, minutes] = human.split(":").map(Number);
    const totalSeconds = hours * 3600 + minutes * 60;
    return totalSeconds;
}

function ConvertSecondsToHuman(seconds, format = "hh:mm") {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");

    return format.replace("hh", formattedHours).replace("mm", formattedMinutes);
}

function convertSeconds2Delay(seconds1, seconds2) {
    const delay = seconds1 - seconds2;
    const minutes = Math.abs(Math.floor(delay / 60));
    return `${delay < 0 ? "-" : "+"}${String(minutes).padStart(2, "0")}`;
}

function createTimeTables() {
    let tt = [
        {
            id: 6771,
            vmz: 100,
            stops: [
                { railwayID: "MWO", arr: "14:02", dep: "14:04" },
                { railwayID: "MIC", arr: "14:09", dep: "14:10" },
                { railwayID: "MEBS", arr: "14:13", dep: "14:13" },
            ],
        },
        {
            id: 6062,
            vmz: 100,
            stops: [
                { railwayID: "MEBS", arr: "14:05", dep: "14:06" },
                { railwayID: "MIC", arr: "14:09", dep: "14:09" },
                { railwayID: "MWO", arr: "14:14", dep: "14:14" },
            ],
        },
        /* {
            id: 1003,
            vmz: 120,
            stops: [
                { railwayID: "MWO", arr: "01:10", dep: "01:12" },
                { railwayID: "MEBS", arr: "01:24", dep: "01:26" },
            ],
        }, */
    ];

    tt.forEach((t) =>
        t.stops.forEach((s) => {
            s.dep = ConvertHumanToSeconds(s.dep);
            s.arr = ConvertHumanToSeconds(s.arr);
        })
    );

    return tt;
}

function createTrains() {
    return timetables.map((tt) => {
        return {
            position: null, //position der Spitze des Zuges
            intermediate: 0,
            nextTime: tt.stops[0].arr,
            timeTable: tt,
            timeTableIndex: 0,
            ended: false,
            log: [],
        };
    });
}

function calculateTrainTravelTime(distance_km, accelerationRate, decelerationRate, initialSpeed_km, targetSpeed_km, finalSpeed_km) {
    const distance = distance_km * 1000,
        initialSpeed = initialSpeed_km / 3.6,
        targetSpeed = targetSpeed_km / 3.6,
        finalSpeed = finalSpeed_km / 3.6;

    // Calculate maximum achievable speed within the given distance
    const maxAchievableSpeed = Math.sqrt(initialSpeed ** 2 + 2 * accelerationRate * distance);

    // Check if the target speed is achievable
    if (maxAchievableSpeed < targetSpeed) {
        return calculateTrainTravelTime(distance_km, accelerationRate, decelerationRate, initialSpeed_km, maxAchievableSpeed * 3.6, finalSpeed_km);
    }

    // Calculate acceleration time
    const accelerationTime = (targetSpeed - initialSpeed) / accelerationRate;
    const accelerationDistance = 0.5 * accelerationRate * accelerationTime ** 2 + initialSpeed * accelerationTime;

    // Calculate deceleration time
    let decelerationTime = 0;
    let decelerationDistance = 0;
    if (finalSpeed < targetSpeed) {
        decelerationTime = (targetSpeed - finalSpeed) / decelerationRate;
        decelerationDistance = 0.5 * decelerationRate * decelerationTime ** 2 + finalSpeed_km * decelerationTime;
    }
    if (distance - accelerationDistance - decelerationDistance < 0) debugger;

    // Calculate constant speed time
    const constantSpeedTime = (distance - accelerationDistance - decelerationDistance) / targetSpeed;

    // Total travel time
    const totalTravelTime = accelerationTime + constantSpeedTime + decelerationTime;

    return totalTravelTime;
}

function calculateTrainTravel(train, track, rev, initialSpeed = 60, finalSpeed = 0) {
    if (track.sections) {
        let time = 0,
            speed = 0;

        if (rev)
            for (let index = track.sections.length - 1; index >= 0; index--) {
                const section = track.sections[index];

                time += calculateTrainTravelTime(section.length, 1, 1, speed, Math.min(section.speed, train.timeTable.vmz), index > 0 ? track.sections[index - 1].speed : finalSpeed);
                speed = section.speed;
            }
        else
            for (let index = 0; index < track.sections.length; index++) {
                const section = track.sections[index];

                time += calculateTrainTravelTime(
                    section.length,
                    1,
                    1,
                    speed,
                    Math.min(section.speed, train.timeTable.vmz),
                    index < track.sections.length - 1 ? track.sections[index + 1].speed : finalSpeed
                );
                speed = section.speed;
            }

        return time;
    } else {
        return calculateTrainTravelTime(track.length, 1, 1, initialSpeed, Math.min(track.speed, train.timeTable.vmz));
    }
}

function runTrains() {
    while (trains.some((t) => !t.ended)) {
        let train = null,
            time = Number.MAX_VALUE;
        trains.forEach((t) => {
            if (t.nextTime < time && !t.ended) {
                train = t;
                time = t.nextTime;
            }
        });

        calcTrain(train);
    }

    console.log("Fertig");
    drawDiagramm();
}

function calcTrain(train) {
    console.log(train.timeTable.id + " calculating");
    let nextTT_Stop;
    let nextStopIndexOnRailway;
    let rev;

    //liegen laut fahrplan noch Halte vor ihm?
    if (train.timeTableIndex < train.timeTable.stops.length) {
        nextTT_Stop = train.timeTable.stops[train.timeTableIndex];
        nextStopIndexOnRailway = getRilwayIndexById(nextTT_Stop.railwayID);

        let nextPosition;

        if (train.position == null) {
            //zug einsetzen
            nextPosition = railway[nextStopIndexOnRailway];
            console.log("soll eingesetzt werden in " + nextPosition.name);
        } else {
            //rausfinden in welche Richtung wir eigentlich fahren
            if (nextStopIndexOnRailway > getRilwayIndexById(train.position.id)) {
                nextPosition = train.position.next;
                rev = false;
            } else {
                nextPosition = train.position.prev;
                rev = true;
            }
        }

        if (nextPosition) {
            //console.log("nächster Abschnitt: " + nextStep.id);
            if (nextPosition.type == BAHNHOF) {
                if (train.intermediate == 0) {
                    //zug ist noch vor dem Bahnhof

                    //ist der Bahnhof frei?
                    if (nextPosition.trains.length < nextPosition.tracks) {
                        //Zeit in den Bahnhof zu fahren
                        console.log("fährt in: " + nextPosition.name + " ein");
                        train.nextTime += 30;
                        train.intermediate = 1;
                        nextPosition.trains.push(train);
                    } else {
                        console.log("wartet vor: " + nextPosition.name);
                        train.nextTime += 10;
                        return;
                    }
                } else {
                    train.log.push({ railwayID: nextPosition.id, arr: train.nextTime });
                    if (train.position) train.position.trains.remove(train);
                    train.position = nextPosition;
                    train.intermediate = 0;

                    //Wenn der Bahnhof ein Planhalt ist
                    if (nextTT_Stop.railwayID == nextPosition.id) {
                        console.log(
                            `Hält in ${nextPosition.name} um ${ConvertSecondsToHuman(train.nextTime)} mit ${convertSeconds2Delay(train.nextTime, train.timeTable.stops[train.timeTableIndex].dep)}`
                        );

                        train.timeTableIndex++; //fahrplan weiterschalten
                        train.nextTime = Math.max(train.nextTime + MIN_STANDZEIT, nextTT_Stop.dep);
                    }
                }
            } else if (nextPosition.type == STRECKE) {
                if (nextPosition.trains.length < 1) {
                    if (train.position.type == BAHNHOF) train.log.last().dep = train.nextTime;
                    console.log("fährt ab mit " + convertSeconds2Delay(train.nextTime, train.timeTable.stops[train.timeTableIndex - 1].dep));
                    train.nextTime += calculateTrainTravel(train, nextPosition, rev); //; calculateTrainTravelTime(nextPosition.length, 1, 1, 0, Math.min(nextPosition.speed, train.timeTable.vmz));

                    if (train.position) train.position.trains.remove(train);
                    train.position = nextPosition;
                    train.position?.trains.push(train);
                } else {
                    console.log("wartet in " + train.position.name);
                    train.nextTime += 10;
                    return;
                }
            }
        }
    } else {
        if (train.position.type == BAHNHOF) train.log.last().dep = train.nextTime;
        console.log("Endstation");
        train.ended = true;
    }
}

//zeit-weg-linien-diagramm

var config = {
    max_time: 0,
    min_time: 0,
    max_distance: 0,
    canvas: null,
    ctx: null,
    xMap: null,
    padding: [0, 20, 0, 20],
    margin: [60, 60, 20, 60],
};

function calcX_FromDistance(distance) {
    return ((myCanvas.width - (config.padding[1] + config.padding[3] + config.margin[1] + config.margin[3])) / config.max_distance) * distance + config.padding[3] + config.margin[3];
}

function calcY_FromTime(time) {
    return (
        ((myCanvas.height - (config.padding[0] + config.padding[2] + config.margin[0] + config.margin[2])) / (config.max_time - config.min_time)) * (time - config.min_time) +
        config.padding[0] +
        config.margin[0]
    );
}

function createMapFromRailway() {
    const m = new Map();
    let km = 0;
    railway.forEach((element) => {
        switch (element.type) {
            case BAHNHOF:
                m.set(element.id, km);
                break;
            case STRECKE:
                km += element.length;
                break;
        }
    });
    config.max_distance = km;
    return m;
}

function getMaxTime() {
    let maxTime = 0;
    timetables.forEach((tt) => {
        maxTime = Math.max(maxTime, tt.stops.last().dep);
    });
    trains.forEach((tt) => {
        maxTime = Math.max(maxTime, tt.log.last().dep);
    });
    return maxTime;
}

function getMinTime() {
    let minTime = Number.MAX_VALUE;
    timetables.forEach((tt) => {
        minTime = Math.min(minTime, tt.stops[0].arr);
    });
    return minTime;
}

function drawText(ctx, text, x, y, deg = 0, align = "left") {
    let fontSize = "14px";
    let fontFamily = "Arial";

    ctx.font = fontSize + " " + fontFamily;
    var angle = rad(deg);

    ctx.save(); // saves the current state
    ctx.translate(x, y); // move the rotation point to the center of the text
    ctx.rotate(angle); // rotate the canvas by the specified angle

    let x2;
    if (align == "left") x2 = 0;
    else if (align == "center") x2 = -ctx.measureText(text).width / 2;
    else x2 = -ctx.measureText(text).width;

    ctx.fillText(text, x2, 0); // draw the text
    ctx.restore(); // restores the state
}

function setupDiagramm(params) {
    // Setze die Größe des myCanvas auf die volle Breite und Höhe des Fensters
    myCanvas.width = wrapper.clientWidth;
    myCanvas.height = wrapper.clientHeight;

    config.ctx = myCanvas.getContext("2d");

    config.canvas = myCanvas;
    config.max_time = getMaxTime();
    config.min_time = getMinTime();
    config.xMap = createMapFromRailway();
}

function drawDiagramm() {
    setupDiagramm();

    // Definiere den Abstand zum Rand
    let margin = config.margin;

    const ctx = config.ctx;
    // Zeichne die x-Achse
    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(margin[3], margin[0], myCanvas.width - margin[1] - margin[3], myCanvas.height - margin[0] - margin[2]);

    drawRailway(ctx);

    trains.forEach((train) => {
        //drawDataGraph(train.timeTable.stops, true);
        drawDataGraph(train.timeTable.id, train.log, false);
    });
}

function drawRailway(ctx) {
    railway
        .filter((element) => element.type === BAHNHOF)
        .forEach((element) => {
            const distance = config.xMap.get(element.id);
            const x = calcX_FromDistance(distance);
            drawText(ctx, element.name, x, config.margin[0] - 8, -90);

            ctx.beginPath();
            ctx.moveTo(x, config.margin[0] + config.padding[0]);
            ctx.lineTo(x, myCanvas.height - config.margin[2] - config.padding[2]);
            ctx.strokeStyle = "#eeeeee";
            ctx.strokeStyle = "#999999";
            ctx.stroke();
        });
}

function drawDataGraph(train, data, dotted) {
    const ctx = config.ctx;
    if (dotted) ctx.setLineDash([5, 15]);
    ctx.beginPath();

    let x,
        y,
        deg = 0,
        last;
    const z = config.xMap.get(data[0].railwayID) > config.xMap.get(data[1].railwayID);

    for (let index = 0; index < data.length; index++) {
        const stop = data[index];
        const nextStop = data[index + 1];

        x = calcX_FromDistance(config.xMap.get(stop.railwayID));
        y = calcY_FromTime(stop.arr);

        ctx.moveTo(x, y);
        y = calcY_FromTime(stop.dep);
        ctx.lineTo(x, y);
        const p1 = { x: x, y: y };
        if (nextStop) {
            x = calcX_FromDistance(config.xMap.get(nextStop.railwayID));
            y = calcY_FromTime(nextStop.arr);
            const p2 = { x: x, y: y };
            deg = Math.atan(geometry.slope(p1, p2)) * (180 / Math.PI);

            drawText(ctx, ConvertSecondsToHuman(stop.dep, "mm"), p1.x, p1.y + 15, deg, z ? "right" : "left");
            ctx.lineTo(x, y);

            drawText(ctx, ConvertSecondsToHuman(nextStop.arr, "mm"), p2.x, p2.y - 10, deg, z ? "left" : "right");

            drawText(ctx, train, p1.x + Math.abs(p1.x - p2.x) / (2 * (z ? -1 : 1)), p1.y + Math.abs(p2.y - p1.y) / 2, deg, "middle");
        }
    }
    ctx.strokeStyle = "#0000ff";

    ctx.stroke();
    if (dotted) ctx.setLineDash([]);
}
