var parents = (function () {
    var baseURL = 'https://opendata.guru/api/2';
    var idParentData = 'parent-data';
    var childSIDList = [];
    var orgchart = null;

    function init() {
        var css = '';

        css += '#parent-data {margin: 0; padding: 0}';
        css += '.orgchart {background: none; border: none; min-height: auto; padding: 0; width: 100%}';
        css += '.orgchart>table:first-child {margin: 0 auto}';
        css += '.orgchart .node {border-radius: 8px; margin: -5px 0}';
        css += '.orgchart .node.root {pointer-events:none}';
        css += '.orgchart .node:hover {background: #a4e9f4; cursor: pointer;}';
        css += '.orgchart .node .title {background: #a4e9f4; border: 1px solid #17a2b8;border-bottom: none; color: #17a2b8}';
        css += '.orgchart .node.root .title {background: #17a2b8; color: #fff}';
        css += '.orgchart .node .content {border-color: #17a2b8; height: calc(2.5rem + 2px); margin-bottom: -6px; padding: .25rem}';
        css += '.orgchart tr.lines .downLine {background: #17a2b8; height: 1rem}';
        css += '.orgchart tr.lines td.rightLine, .orgchart tr.lines td.leftLine {border-color: #17a2b8}';

        const style = document.createElement('style');
        style.textContent = css;
        document.head.append(style);

        initOrgChart({});
    }

    function initOrgChart(chartData) {
        orgchart = new OrgChart({
            'chartContainer': '#' + idParentData,
            'data' : chartData,
            'createNode': function(node, data) {
                var div = document.createElement('div');
                div.setAttribute('class', 'content');
                div.innerHTML = '<img style="height:2rem;width:100%;object-fit:contain" src="' + data.image + '">';
                node.appendChild(div);

                node.addEventListener('click', () => {
                    catalog.setSID(data.sid);
                });
            },
        });
    }

    function funcUpdateSID() {
        updateParentData(catalog.getSObject());
    }

    function updateParentData(sObject) {
        var chartContainer = document.getElementById(idParentData);
        chartContainer.innerHTML = '';
//        var selectedChart = chartContainer.querySelector('.orgchart');
//        selectedChart.innerHTML = '';

        var chartData = {
            className: 'sid-' + sObject.sid + ' root',
            name: system.getTitle(sObject),
            image: sObject.image.url,
            sid: sObject.sid,
            type: data.getTypeString(sObject.type),
        };

        initOrgChart({});
        orgchart.buildHierarchy(orgchart.chart, chartData, 0, function() {
            fillSID(sObject.sid);
        });
    }

    function fillSID(sid) {
        loadLObjects(sid, baseURL + '/s/' + sid + '/l');
    }

    function loadLObjects(parentSID, url) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        var chartContainer = document.getElementById(idParentData);
        chartContainer.classList.add('loading-bar');

        xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                chartContainer.classList.remove('loading-bar');
                storeLObjects(parentSID, JSON.parse(this.responseText));
            } else if (this.readyState == 4) {
                chartContainer.classList.remove('loading-bar');
				var error = '';
                try {
                    error = JSON.parse(this.responseText);
                    console.error(error);
                } catch(e) {
                }
            }
        }

        xhr.send();
    }

    function storeLObjects(parentSID, payload) {
        lObjects = [];

        if (payload && payload.lobjects) {
            lObjects = payload.lobjects;
        }

        var children = [];
        var sIDs = [];
        lObjects.forEach(lObject => {
/*            children.push({
                id: 'lid-' + lObject.lid,
                name: lObject.title,
                haspart: lObject.haspart,
                ispartof: lObject.ispartof,
                identifier: lObject.identifier,
                pid: lObject.pid,
                pobject: lObject.pobject,
                sid: lObject.sid,
            });*/

            if (lObject.pobject && lObject.pobject.sobject) {
                var sObject = lObject.pobject.sobject;

                if ((parentSID !== sObject.sid) && (!children.find((child) => child.sid === sObject.sid))) {
                    childSIDList[sObject.sid] = {
                        className: 'sid-' + sObject.sid,
                        name: system.getTitle(sObject),
                        image: sObject.image.url,
                        sid: sObject.sid,
                        type: data.getTypeString(sObject.type),
                        childrenSIDs: []
                    };

                    children.push(getChild(sObject.sid));
                    childSIDList[parentSID]?.childrenSIDs.push(sObject.sid);

//                    var elem = document.getElementById('sid-' + sObject.sid);
                    var elems = document.getElementsByClassName('sid-' + sObject.sid);
                    if (elems.length === 0) {
                        sIDs.push(sObject.sid);
                    }
                }
            }
        });

//        var selectedNode = document.getElementById('sid-' + parentSID);
        var selectedNodes = document.querySelectorAll('.sid-' + parentSID);
        selectedNodes.forEach((selectedNode) => {
            orgchart.addChildren(selectedNode, {
                'children': children
            });
        });

        window.setTimeout(function() {
            sIDs.forEach(sID => {
                fillSID(sID);
            });
        }, 100);
    }

    function getChild(sid) {
        var child = childSIDList[sid];

//        child.children = [];
/*console.log(child.childrenSIDs, childSIDList[sid].childrenSIDs);
        child.childrenSIDs.forEach((sid) => {
console.log(sid);
            child.children.push(getChild(sid));
        });
console.log(child);*/
        return child;
    }

    init();

    return {
        updateSID: funcUpdateSID,
    };
}());