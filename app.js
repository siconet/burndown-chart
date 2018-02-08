var sprint = [];
var commitment = 0;
var remainingStoryPoints = 0;
var actualBurnData = []
var sprintLength = sprint.length;
var actualBurnDays = actualBurnData.length;
var remainingDay = sprintLength - actualBurnDays;
var averageBurnValue, expectedBurnValue;

var startWork = false;
/*
var actualData = generateActualData();
var averageData = generateAverageData();
var expectedData = generateExpectedData();
*/

var webserviceUrl = "http://demo2102190.mockable.io/sales1";

function getBurnupData() {
    jQuery.ajax({
        url: webserviceUrl
    }).done(function(data){
        if ( console && console.log ) {
            console.log( "Burnup data:", data );
        }
        var teamData = data.teams[0];

        // Update data in global vars
        sprint = teamData.sprint;
        commitment = remainingStoryPoints = teamData.commitment; // how many story points committed for sprint
        actualBurnData = teamData.burnData; // how many story points finished per day
        sprintLength = sprint.length;
        actualBurnDays = actualBurnData.length;
        remainingDay = sprintLength - actualBurnDays;
        actualData = generateActualData();

        var updatedChartData = {
            labels: sprint.concat(['...', '...', '...']),
            datasets: [{
                type: 'bar',
                label: 'Actual',
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                data: generateActualData(),
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }, {
                type: 'line',
                tension: 0,
                label: 'Average (Velocity)',
                backgroundColor: "rgba(255,99,132, 0)",
                data: generateAverageData(),
                borderColor: "rgba(255,99,132,1)",
                borderWidth: 2
            }, {
                type: 'line',
                tension: 0,
                label: 'Expected (Velocity)',
                backgroundColor: "rgba(255,99,132, 0)",
                data: generateExpectedData(),
                borderColor: "rgba(255, 206, 86, 1)",
            }
            ]
        };

        // Redraw chart
        updateChartData("Burnup Chart for " + teamData.team, updatedChartData, commitment);
    });
}

function generateActualData() {
    var data = actualBurnData.map(function(x) {
        return remainingStoryPoints - (+x)
    });
    console.log("actualdata", data);

    return data;
}


function generateAverageData() {
  var sum = 0;
    actualBurnData.forEach(function(value) {
    sum += value;
  });
  var average = actualBurnData[actualBurnData.length - 1] / actualBurnDays;
  averageBurnValue = average.toFixed(0);
  startWork = average > 0;
  var data = [];
  i = 0;
  while (true && startWork) {
    data[i] = remainingStoryPoints - average * (i+1);
    if (data[i] <= 0) break;
    i++;
  }
    console.log("average data", data, "actualBurnData", actualBurnData, "averageBurnValue", averageBurnValue, "remainingStoryPoints", remainingStoryPoints);
  return data;
}

function generateExpectedData() {
  var data = [];
  data[actualBurnDays - 1] = actualData[actualBurnDays - 1];
  var rate = (data[actualBurnDays - 1] - 0) / remainingDay;
  expectedBurnValue = rate.toFixed(0);
  for (var i = actualBurnDays; i < sprintLength - 1; i++) {
    data[i] = data[i - 1] - rate;
  }
  data[sprintLength - 1] = 0;
  console.log("expected data", data, "expectedBurnValue", expectedBurnValue, "actualBurnDays", actualBurnDays, "remainingDay", remainingDay);
  return data;
}

function updateChartData(title, data, maxval) {

    var ctx = document.getElementById("canvas").getContext("2d");
    window.myBar = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            title: {
                display: true,
                text: title
            },
            scales: {
                yAxes: [{
                    ticks: {
                        max: maxval,
                        min: 0,
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Story Points'
                    }
                }]
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    label: function(tooltipItems, data) {
                        switch (tooltipItems.datasetIndex) {
                            case 0:
                                return  remainingStoryPoints - (+tooltipItems.yLabel) + ' SP';
                            case 1:
                                return averageBurnValue + ' SP / day';
                            default:
                                return expectedBurnValue + ' SP / day';
                                break;
                        }
                    },
                    title: function(tooltipItems) {
                        switch (tooltipItems[0].datasetIndex) {
                            case 0:
                                return 'Actual ' + '(' + tooltipItems[0].xLabel + ')';
                            case 1:
                                return 'Average (Velocity)';
                            default:
                                return 'Expected (Velocity)';
                                break;
                        }
                    },
                }
            },
        }
    });
}


window.onload = function() {

    getBurnupData();

};
