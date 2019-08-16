const dom = document.getElementById("container");
const myChart = echarts.init(dom);
myChart.showLoading();

const counter = array => {
  return array.reduce((acc, curr) => {
    acc[curr] ? acc[curr]++ : acc[curr] = 1
    return acc
  }, {})
}

const addConsultantNodes = (nodes, data) => {
  let consultants = [...new Set(data.projects.flatMap(project => project.team))]

  consultants.forEach(consultant => {
    nodes.push({
      name: consultant,
      category: 0,
      value: 10,
      label: {
        normal: { show: true }
      }
    })
  })
}

const addTechNodes = (nodes, data) => {
  let techsWithCount = counter(data.projects.flatMap(project => project.stack))

  Object.entries(techsWithCount).forEach(([tech, count]) => {
    nodes.push({
      name: tech,
      category: 2,
      value: 10,
      label: {
        normal: { show: true }
      },
      symbolSize: 10 * count
    })
  })
}

const addConsultantTechLinks = (links, consultantTechCounts) => {
  Object.entries(consultantTechCounts).forEach(([consultant, techCounts]) => {
    Object.entries(techCounts).forEach(([tech, count]) => {
      links.push({
        source: tech,
        target: consultant,
        lineStyle: {
          width: count**2
        }
      })
    })
  })
}

$.get('./data.json', function (data) {
  myChart.hideLoading();

  let nodes = []
  let links = []

  addConsultantNodes(nodes, data)
  addTechNodes(nodes, data)

  let consultantTechCount = {}

  data.projects.forEach(project => {
    nodes.push({
      name: project.name,
      category: 1,
      value: 10,
      symbolSize: 10 * project.team.length,
      label: {
        normal: { show: true }
      }
    })

    project.team.forEach(teammate => {
      links.push({
        source: teammate,
        target: project.name
      })
    })

    project.stack.forEach(tech => {
      links.push({
        source: tech,
        target: project.name
      })
    })

    project.stack.forEach(tech => {
      project.team.forEach(teammate => {
        if (consultantTechCount[teammate]) {
          consultantTechCount[teammate][tech] ? consultantTechCount[teammate][tech]++ : consultantTechCount[teammate][tech] = 1
        } else {
          consultantTechCount[teammate] = {}
          consultantTechCount[teammate][tech] = 1
        }
      })
    })
  })

  addConsultantTechLinks(links, consultantTechCount)

  const categories = ["Consultants", "Projects", "Tech"].map(e => ({ name: e }))

  const option = {
    title: {
      text: 'SF TE Projects',
      subtext: 'Circular layout',
      top: 'bottom',
      left: 'right'
    },
    tooltip: {},
    legend: [{
      data: categories.map(function (a) {
        return a.name;
      })
    }],
    animationDurationUpdate: 1500,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        name: 'TE Projects',
        hoverAnimation: false,
        focusNodeAdjacency: true,
        type: 'graph',
        layout: 'circular',
        circular: {
          rotateLabel: true
        },
        data: nodes,
        links: links,
        categories: categories,
        roam: true,
        label: {
          normal: {
            position: 'right',
            formatter: '{b}'
          }
        },
        lineStyle: {
          normal: {
            color: 'source',
            curveness: 0.3
          }
        }
      }
    ]
  };

  myChart.setOption(option, true);
}, 'json')