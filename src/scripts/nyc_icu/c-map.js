import * as d3 from 'd3'

const margin = { top: 100, left: 50, right: 150, bottom: 30 }

const height = 500 - margin.top - margin.bottom

const width = 700 - margin.left - margin.right

const svg = d3
  .select('#chart-c')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

const parseTime = d3.timeParse('%Y-%m-%d')

const xPositionScale = d3.scaleLinear().range([0, width])
const yPositionScale = d3.scaleLinear().range([height, 0])

const colorScale = d3
  .scaleOrdinal()
  .range([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5',
    '#d9d9d9',
    '#bc80bd'
  ])

const line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.datetime)
  })
  .y(function(d) {
    return yPositionScale(d.capacity)
  })

d3.csv(require('/data/by_borough.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  datapoints.forEach(d => {
    d.datetime = parseTime(d.collection_week)
  })
  const dates = datapoints.map(d => d.datetime)
  const capacity = datapoints.map(d => +d.icu_beds_used_pct_7_day_avg)
  console.log('dates', dates)

  xPositionScale.domain(d3.extent(dates))
  yPositionScale.domain([0,d3.max(capacity)])

  const nested = d3
    .nest()
    .key(function(d) {
      return d.Borough
    })
    .entries(datapoints)

  // nested.push(nested[0])
  // nested.push(nested[1])

  // svg
  //   .append('text')
  //   .attr('font-size', '24')
  //   .attr('text-anchor', 'middle')
  //   .text('U.S. housing prices fall in winter')
  //   .attr('x', width / 2)
  //   .attr('y', -40)
  //   .attr('dx', 40)
  //   .attr('class', 'title')

  // const rectWidth =
  //   xPositionScale(parseTime('March-21')) -
  //   xPositionScale(parseTime('December-20'))

  const final = nested[0].values[0].icu_beds_used_pct_7_day_avg
  console.log('final capacity', final)

  svg
    .selectAll('.lines')
    .data(nested)
    .enter()
    .append('path')
    .attr('class', function(d) {
      console.log('hey!', d.key.toLowerCase().replace(/[^a-z]/g, ''))
      return 'lines ' + d.key.toLowerCase().replace(/[^a-z]/g, '')
    })
    // .classed('expensive', d => {
    //   if (d.values[0].price > usFinal) {
    //     return true
    //   }
    // })
    .attr('d', function(d) {
      return line(d.values)
    })
    .attr('stroke', function(d) {
      return colorScale(d.key.toLowerCase().replace(/[^a-z]/g, ''))
    })
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .style('visibility', 'hidden')

  svg
    .selectAll('circle')
    .data(nested)
    .enter()
    .append('circle')
    .attr('class', function(d) {
      return 'circles ' + d.key.toLowerCase().replace(/[^a-z]/g, '')
    })
    .classed('expensive', d => {
      if (d.values[0].icu_beds_used_pct_7_day_avg > final) {
        return true
      }
    })
    .attr('fill', function(d) {
      return colorScale(d.key.toLowerCase().replace(/[^a-z]/g, ''))
    })
    .attr('r', 4)
    .attr('cy', function(d) {
      return yPositionScale(d.values[0].icu_beds_used_pct_7_day_avg)
    })
    .attr('cx', function(d) {
      return xPositionScale(d.values[0].datetime)
    })
    .style('visibility', 'hidden')

  svg
    .selectAll('.labels')
    .data(nested)
    .enter()
    .append('text')
    .attr('class', function(d) {
      // console.log(d.key)
      return d.key.toLowerCase().replace(/[^a-z]/g, '')
    })
    .classed('labels', true)
    .classed('expensive', d => {
      if (d.values[0].icu_beds_used_pct_7_day_avg > final) {
        return true
      }
    })
    .attr('y', function(d) {
      return yPositionScale(d.values[0].icu_beds_used_pct_7_day_avg)
    })
    .attr('x', function(d) {
      return xPositionScale(d.values[0].datetime)
    })
    .text(function(d) {
      return d.key
    })
    .attr('dx', 6)
    .attr('dy', 4)
    .attr('font-size', '12')
    .style('visibility', 'hidden')

  // here's the scrollytelling

  // console.log(nested)
  // d3.select('#line-step').on('stepin', () => {
  //   svg.selectAll('.lines').style('visibility', 'visible')
  //   svg.selectAll('.circles').style('visibility', 'visible')
  //   svg.selectAll('.labels').style('visibility', 'visible')
  // })

  // d3.select('#us-step').on('stepin', () => {
  //   svg.selectAll('.lines').attr('stroke', 'lightgrey')
  //   svg.selectAll('.circles').attr('fill', 'lightgrey')
  //   svg.selectAll('.labels').attr('fill', 'lightgrey')

  //   svg.select('path.us').attr('stroke', 'red')
  //   svg.select('circle.us').attr('fill', 'red')
  //   svg
  //     .select('text.us')
  //     .attr('fill', 'red')
  //     .attr('font-weight', 600)
  // })

  // d3.select('#region-step').on('stepin', () => {
  //   svg.selectAll('path.expensive').attr('stroke', 'lightblue')
  //   svg.selectAll('circle.expensive').attr('fill', 'lightblue')
  //   svg
  //     .selectAll('text.expensive')
  //     .attr('fill', 'lightblue')
  //     .attr('font-weight', 600)
  // })

  // d3.select('#winter-step').on('stepin', () => {
  //   svg
  //     .append('rect')
  //     .attr('x', xPositionScale(parseTime('December-16')))
  //     .attr('y', 0)
  //     .attr('width', rectWidth)
  //     .attr('height', height)
  //     .attr('fill', '#C2DFFF')
  //     .lower()
  // })

  // here are the axes

  const xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.timeFormat('%y-%b-%d'))
    .ticks(9)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  const yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  // function render() {
  //   const svgContainer = svg.node().closest('div')
  //   const svgWidth = svgContainer.offsetWidth
  //   // Do you want it to be full height? Pick one of the two below
  //   // const svgHeight = height + margin.top + margin.bottom
  //   const svgHeight = window.innerHeight

  //   const actualSvg = d3.select(svg.node().closest('svg'))
  //   actualSvg.attr('width', svgWidth).attr('height', svgHeight)

  //   const newWidth = svgWidth - margin.left - margin.right
  //   const newHeight = svgHeight - margin.top - margin.bottom

  //   // Update our scale
  //   xPositionScale.range([0, newWidth])
  //   yPositionScale.range([newHeight, 0])

  //   // Update things you draw

  //   svg.selectAll('.lines').attr('d', function(d) {
  //     return line(d.values)
  //   })

  //   svg
  //     .selectAll('.circles')
  //     .attr('cy', function(d) {
  //       return yPositionScale(d.values[0].price)
  //     })
  //     .attr('cx', function(d) {
  //       return xPositionScale(d.values[0].datetime)
  //     })

  //   svg
  //     .selectAll('.labels')
  //     .attr('y', function(d) {
  //       return yPositionScale(d.values[0].price)
  //     })
  //     .attr('x', function(d) {
  //       return xPositionScale(d.values[0].datetime)
  //     })

  //   svg.select('.title').attr('x', newWidth / 2)

  //   const rectWidth =
  //     xPositionScale(parseTime('February-17')) -
  //     xPositionScale(parseTime('November-16'))

  //   svg
  //     .selectAll('rect')
  //     .attr('x', xPositionScale(parseTime('December-16')))
  //     .attr('width', rectWidth)
  //     .attr('height', newHeight)

  //   // Update axes
  //   svg
  //     .select('.x-axis')
  //     .attr('transform', 'translate(0,' + newHeight + ')')
  //     .call(xAxis)
  //   svg.select('.y-axis').call(yAxis)
  // }

  // // When the window resizes, run the function
  // // that redraws everything
  // window.addEventListener('resize', render)

  // // And now that the page has loaded, let's just try
  // // to do it once before the page has resized
  // render()
}
