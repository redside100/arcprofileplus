// ==UserScript==
// @name Arc Profile Plus
// @author Redside
// @version 0.1
// @description Shows existing extra information on your online Arcaea profile
// @run-at document-start
// @match https://arcaea.lowiro.com/en/profile/
// ==/UserScript==

let apiResponse = undefined;
let apiUpdate = false;

(function() {
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        this.addEventListener('load', function() {
            if (this.responseURL === "https://webapi.lowiro.com/webapi/user/me") {
                apiResponse = JSON.parse(this.responseText);
                apiUpdate = true;
            }
        });
        origOpen.apply(this, arguments);
    };
})();

function createColumn() {
    const col = document.createElement("div");
    col.className = "arcPlusCol";
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.flexBasis = "100%";
    col.style.flex = 1;
    return col;
}

function createRow() {
    const row = document.createElement("div");
    row.className = "arcPlusRow";
    row.style.display = "flex";
    row.style.flexDirection = "row";
    row.style.flexWrap = "wrap";
    row.style.width = "100%";
    return row;
}

function addContainer() {
    const content = document.getElementsByClassName("content")[1];
    const exists = document.getElementById("arcPlusContainer") !== null;

    if (exists) {
        return;
    }

    if (window.location.href !== "https://arcaea.lowiro.com/en/profile/") {
        return;
    }

    if (content === undefined) {
        setTimeout(addContainer, 200);
        return;
    }

    const extraContainer = document.createElement("div");
    extraContainer.id = "arcPlusContainer";
    extraContainer.style.marginBottom = "1rem";
    extraContainer.style.width = "100%";

    const statusHeader = document.createElement("h1");
    statusHeader.innerHTML = "Status";
    extraContainer.appendChild(statusHeader);

    const row1 = createRow();
    const col1 = createColumn();
    const col2 = createColumn();

    row1.appendChild(col1);
    row1.appendChild(col2);

    extraContainer.appendChild(row1);

    const coresHeader = document.createElement("h1");
    coresHeader.innerHTML = "Cores";
    extraContainer.appendChild(coresHeader);

    const row2 = createRow();
    const col3 = createColumn();
    const col4 = createColumn();

    row2.appendChild(col3);
    row2.appendChild(col4);

    extraContainer.appendChild(row2);

    const rsHeader = document.createElement("h1");
    rsHeader.innerHTML = "Recent Score";
    extraContainer.appendChild(rsHeader);

    const row3 = createRow();
    const col5 = createColumn();
    const col6 = createColumn();
    const col7 = createColumn();
    row3.appendChild(col5);
    row3.appendChild(col6);
    extraContainer.appendChild(row3);
    extraContainer.appendChild(col7);

    content.appendChild(extraContainer);
}

function createPara(text) {
    const para = document.createElement("p");
    para.innerHTML = text;
    para.style.margin = "0.5rem";
    return para;
}

function getTimeToTimestamp(timestamp) {
    const now = Date.now();
    const seconds = (timestamp - now) / 1000;
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds / 60) % 60);

    if (minutes < 0 || hours < 0) {
        return "now"
    }
    return "in " + hours + "h " + String(minutes).padStart(2, '0') + "m";
}

function updateContent() {

    if (apiResponse === undefined) {
        return;
    }

    if (!apiUpdate) {
        return;
    }

    const info = apiResponse;
    const containerExists = document.getElementById("arcPlusContainer") !== null;

    if (!containerExists) {
        addContainer();
        return;
    }

    apiUpdate = false;

    const columns = document.getElementsByClassName("arcPlusCol");

    columns.forEach((col) => {
        col.innerHTML = '';
    });

    columns[0].appendChild(createPara("Stamina: " + info.value.stamina + "/" + info.value.max_stamina));
    columns[1].appendChild(createPara("Max " + getTimeToTimestamp(info.value.max_stamina_ts)));
    columns[0].appendChild(createPara("Beyond Boost Gauge: " + Math.round(info.value.beyond_boost_gauge * 100) / 100));

    let multiplier = 1;
    if (info.value.beyond_boost_gauge >= 200) {
        multiplier = 3;
    } else if (info.value.beyond_boost_gauge >= 100) {
        multiplier = 2;
    }

    columns[1].appendChild(createPara(multiplier + "x Multiplier"));
    columns[0].appendChild(createPara("Fragment Recharge"));
    columns[1].appendChild(createPara("Available " + getTimeToTimestamp(info.value.next_fragstam_ts)));

    columns[2].appendChild(createPara("Colorful Cores: " + info.value.cores.find(x => x.core_type === "core_colorful")?.amount));
    columns[3].appendChild(createPara("Crimson Cores: " + info.value.cores.find(x => x.core_type === "core_crimson")?.amount));
    columns[2].appendChild(createPara("Hollow Cores: " + info.value.cores.find(x => x.core_type === "core_hollow")?.amount));
    columns[3].appendChild(createPara("Desolate Cores: " + info.value.cores.find(x => x.core_type === "core_desolate")?.amount));

    let difficulty = undefined;
    if (info.value.recent_score?.[0]?.difficulty === 0) {
        difficulty = "(PST)";
    } else if (info.value.recent_score?.[0]?.difficulty === 1) {
        difficulty = "(PRS)";
    } else if (info.value.recent_score?.[0]?.difficulty === 2) {
        difficulty = "(FTR)";
    } else if (info.value.recent_score?.[0]?.difficulty === 3) {
        difficulty = "(BYD)";
    }

    columns[4].appendChild(createPara("Song ID: " + info.value.recent_score?.[0]?.song_id + " " + difficulty));

    columns[5].appendChild(createPara("Score: " + info.value.recent_score?.[0]?.score));
    columns[4].appendChild(createPara("Shiny Perfect Count: " + info.value.recent_score?.[0]?.shiny_perfect_count));
    columns[5].appendChild(createPara("Perfect Count: " + info.value.recent_score?.[0]?.perfect_count));
    columns[4].appendChild(createPara("Near Count: " + info.value.recent_score?.[0]?.near_count));
    columns[5].appendChild(createPara("Miss Count: " + info.value.recent_score?.[0]?.miss_count));
    columns[6].appendChild(createPara("<i>Played on " + (new Date(info.value.recent_score?.[0]?.time_played) + "</i>")));

}

setInterval(updateContent, 200);
