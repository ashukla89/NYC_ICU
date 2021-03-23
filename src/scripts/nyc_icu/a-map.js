import * as d3 from 'd3'
import * as geojson from 'geojson'

const margin = { top: 0, left: 0, right: 0, bottom: 0 }

const height = 500 - margin.top - margin.bottom

const width = 700 - margin.left - margin.right

const svg = d3
  .select('#chart-a')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// center the map projection on NYC as per: http://bl.ocks.org/phil-pedruco/6646844
const projection = d3.geoMercator().center([-73.94, 40.70])
  .scale(50000)
  .translate([(width) / 2, (height)/2])
const path = d3.geoPath().projection(projection)

const colorScale = d3.scaleSequential(d3.interpolateRdYlBu)//.clamp(true)
const radiusScale = d3.scaleSqrt().range([0, 1])

Promise.all([
  d3.json(require('/data/nyc.geojson')),
  d3.csv(require('/data/nyc_icu.csv'))
])
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready([json, datapoints]) {
  console.log('What is our data for chart a?')
  console.log(json)
  // console.log(datapoints)
  const boroughs = json.features
  const latestData = datapoints.filter(function(d){
    if (d['collection_week']=='2021/03/12')
    {
      return d
    }
  })

  // const popExtent = d3.extent(datapoints, d => +d.population)
  // colorScale.domain([1, 500000]) // arbitrary because too many were dark

  svg
    .selectAll('path')
    .data(boroughs)
    .enter()
    .append('path')
    .attr('class', 'borough')
    .attr('d', path)
    .attr('fill', 'lightgrey')
    .attr('stroke', 'grey')

  // add one circle for every hospital
  svg
    .selectAll('circle')
    .data(latestData)
    .enter()
    .append('circle')
    .attr('r', d => radiusScale(+d.total_icu_beds_7_day_avg))
    .attr('opacity', 0.7)
    .attr('fill', d => colorScale(1-d.icu_beds_used_pct_7_day_avg)) // invert the color scheme by subtracting
    .attr('transform', function(d) {
      const coords = [d.longitude, d.latitude]
      // console.log(projection(coords))
      return `translate(${projection(coords)})`
    })
}
