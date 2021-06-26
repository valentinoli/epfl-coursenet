import { select, selectAll } from 'd3-selection'
import {
  forceManyBody,
  forceX,
  forceY,
  forceSimulation,
  forceLink,
} from 'd3-force'

import { parseSvg } from 'd3-interpolate/src/transform/parse'
import { zoom, zoomIdentity } from 'd3-zoom'
import { transition } from 'd3-transition'
import { Delaunay } from 'd3-delaunay'
import { easeLinear } from 'd3-ease'
import { drag } from 'd3-drag'

function getTransition(duration = 1000) {
  return transition().duration(duration).ease(easeLinear)
}

export default class Graph {
  vue
  svg
  svgG
  simulation
  node
  link
  zoomBehavior
  voronoi
  voronoiCell
  voronoiExtent
  graphOpacityVoronoi
  graphOpacity
  nodeStrokeWidth = 1
  collisionOffset
  nodeStroke = '#fff'
  linkStroke = '#111'
  arrowMarkerWidth = 10
  arrowMarkerId = 'arrowmarker'
  arrowMarkerUrl
  lecturerPaths
  lecturerImageWidth
  lecturerImageHeight
  lecturerImageViewBox
  container
  isDragging = false
  mouseleft = true
  initialScale = 0
  transitionLinks = false
  defaultForceXYStrength = 0.07
  defaultForceChargeStrength = -200
  defaultForceLinkDistance = 70

  constructor(vue) {
    // We want access to the vue component
    this.vue = vue
    this.graphOpacityVoronoi = vue.graphOpacityVoronoi
    this.graphOpacity = vue.graphOpacity
    this.arrowMarkerUrl = `url(#${this.arrowMarkerId})`

    this.container = select('.svg-container')

    // https://stackoverflow.com/q/16178366/8238129
    this.zoomBehavior = zoom().on('zoom', this.zoomed.bind(this))
    this.svg = this.container
      .select('svg')
      .attr('class', 'svg')
      .attr('cursor', 'move')
      .call(this.zoomBehavior)
      // prevent dblclick zoom behavior
      .on('dblclick.zoom', null)
      // to enable on touch interfaces to close the tooltip
      // that opens when zoomNode() is called
      .on('click', this.vue.hideTooltip)

    this.setSVGViewBox()

    // append a <g> to apply the zoom transform globally on all elements,
    // see zoomed() function
    this.g = this.svg.append('g')

    this.voronoiCell = this.g.append('g').selectAll('path')

    // Arrow markers for directed edges
    const { arrowMarkerWidth: mWidth } = this
    this.g
      .append('defs')
      .append('marker')
      .attr('id', this.arrowMarkerId)
      .attr('viewBox', [0, -mWidth / 2, mWidth, mWidth])
      .attr('refX', 0)
      .attr('refY', 0)
      .attr('markerWidth', mWidth)
      .attr('markerHeight', mWidth)
      .attr('orient', 'auto')
      .attr('xoverflow', 'visible')
      .append('path')
      .attr('d', `M 0,${-mWidth / 2} L ${mWidth},0 L 0,${mWidth / 2}`)
      .attr('fill', this.linkStroke)
      .style('stroke', 'none')

    // Defs for <image>s of lecturers
    this.lecturerImages = this.g.append('defs').selectAll('path')

    const viewBoxWidth = 240
    const viewBoxHeight = 240
    const scale = 1.3
    const imageWidth = viewBoxWidth * scale
    const imageHeight = viewBoxHeight * scale
    const viewBoxMinX = (imageWidth - viewBoxWidth) / 2
    const viewBoxMinY = (imageHeight - viewBoxHeight) / 2
    this.lecturerImageWidth = imageWidth
    this.lecturerImageHeight = imageHeight
    this.lecturerImageViewBox = [
      viewBoxMinX,
      viewBoxMinY,
      viewBoxWidth,
      viewBoxHeight,
    ]

    this.simulation = forceSimulation()
      .force(
        'charge',
        forceManyBody()
          .strength(this.defaultForceChargeStrength)
          .distanceMax(1000)
      )
      .force(
        'link',
        forceLink()
          .id((node) => node.slug) // set node id accessor
          .distance(this.defaultForceLinkDistance) // increase default distance
      )
      .force('x', forceX().strength(this.defaultForceXYStrength))
      .force('y', forceY().strength(this.defaultForceXYStrength))
      .on('tick', this.ticked.bind(this))

    this.defaultForceLinkStrength = this.simulation.force('link').strength()

    this.link = this.g.append('g').selectAll('line')
    this.node = this.g.append('g').selectAll('circle')
  }

  setSVGViewBox() {
    const { container } = this
    const { top, width } = container.node().getBoundingClientRect()

    const minHeight = 400

    // Compute position of svg container relative to
    // the top-left corner of the document:
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    const containerTop = top + window.scrollY

    // Take into account height of bottom navigation panel
    const bottomNavHeight = 56

    // Fix the height of the container relative to the window's inner height
    // to make scrolling disabled unless the viewport is small
    // in which case minHeight is applied:
    const height = Math.max(
      minHeight,
      window.innerHeight - containerTop - bottomNavHeight
    )
    container.style('height', `${height}px`)

    const minX = -width / 2
    const minY = -height / 2

    const viewBox = [minX, minY, width, height]

    // Fit SVG into the container
    this.svg.attr('viewBox', viewBox)

    if (this.voronoiExtent) {
      // Recompute the voronoi extent when the svg is resized
      // https://stackoverflow.com/a/42063664/8238129
      const { scaleX: k, translateX: x, translateY: y } = parseSvg(
        this.g.attr('transform')
      )
      this.setVoronoiExtent({ k, x, y })
    }

    if (this.vue.nodeGroupParam) {
      // Re-render voronoi cell
      this.renderVoronoi()
    }
  }

  getSVGViewBox() {
    return this.svg.attr('viewBox').split(',').map(Number)
  }

  centerGraph() {
    this.svg.transition(getTransition(500)).call(
      // Set initial zoom level, calls this.zoomed()
      this.zoomBehavior.transform,
      zoomIdentity.scale(this.initialScale)
    )
  }

  zoomNode(d, element) {
    this.svg
      .transition(getTransition())
      .call(
        this.zoomBehavior.transform,
        zoomIdentity.scale(this.initialScale * 5).translate(-d.x, -d.y)
      )
      .on('start', () => {
        // prevent selection of other nodes during the transition
        this.isDragging = true
        this.vue.hideTooltip()
      })
      .on('end', () => {
        const { top, bottom, left } = element.getBoundingClientRect()
        this.isDragging = false
        this.vue.showTooltip()
        if (!this.vue.touchInterface) {
          this.vue.$nextTick(() => {
            // update tooltip position after next tick to avoid
            // strange bug that makes tooltip stretch to the far left
            // first time it renders
            this.vue.updateTooltipPosition(
              { clientX: left, clientY: top },
              0,
              // push tooltip below node
              bottom - top + 20
            )
          })
        }
        this.highlightNodeNeighborhood(d, element)
      })
  }

  zoomed({ transform }) {
    // Apply transform on all the svg elements
    this.g.attr('transform', transform)

    // Reset voronoi diagram extent
    this.setVoronoiExtent(transform)

    if (this.vue.controls.nodeGroup) {
      // Re-render the voronoi cells if grouping is applied
      this.renderVoronoi()
    }
  }

  /* Node radius and fill */
  computeNodeRadius(d) {
    const defaultSize = 15
    if (d.sciper) {
      return defaultSize
    }
    const { nodeSize } = this.vue.controls
    switch (nodeSize) {
      case 'credits': {
        const c = Number(d.credits)
        return 15 + c
      }
      case 'registrations': {
        // fallback to 0 when no data available
        let students = 0
        if (d.registrations) {
          students = d.registrations['2019-2020']
        }
        return 5 + Math.log(Math.pow(students, 4) + 1)
      }
      case 'outDegree':
      case 'inDegree':
      case 'degree': {
        return 10 + Math.min(30, d[nodeSize] * 3)
      }
      default: {
        // Default size
        return defaultSize
      }
    }
  }

  nodeRadius(d) {
    const radius = this.computeNodeRadius(d)
    d.radius = radius
    return radius
  }

  computeNodeFill(d, element) {
    const {
      colorMaps: cmap,
      controls: { nodeColor },
    } = this.vue

    if (d.sciper) {
      return 'url(#lecturer-img-null)'
    }

    // color course nodes uniformly if nodeColor parameter is falsy
    if (this.vue.isBipartiteGraph && !nodeColor) {
      return cmap.bipartition[d.bipartition].color
    }

    if (d.neighborhoodKey) {
      return cmap.neighborhood[d.neighborhoodKey].color
    }

    return this.vue.$nodeFillColor(cmap, nodeColor, d)
  }

  /* Link coordinates */
  linkClipHypotenuseFromSource(source, hypotenuse) {
    const offset = source.radius + this.nodeStrokeWidth / 2
    return hypotenuse - offset
  }

  linkClipHypotenuseFromTarget(target, hypotenuse) {
    let offset = target.radius + this.nodeStrokeWidth / 2
    if (this.vue.isDirectedGraph) {
      // take arrow marker width into account if graph is directed
      offset += this.arrowMarkerWidth
    }
    return hypotenuse - offset
  }

  linkAngleHypotenuse(source, target) {
    /**
     * Computes hypothetical hypotenuse (line length) between
     * node centers using the Pythagorean theorem and an angle
     */
    const xDiff = Math.abs(source.x - target.x)
    const yDiff = Math.abs(source.y - target.y)

    const hypotenuse = Math.sqrt(xDiff ** 2 + yDiff ** 2)

    const angle = Math.asin(yDiff / hypotenuse)

    return { angle, hypotenuse }
  }

  linkX2({ source, target }) {
    if (source.x === target.x) {
      return source.x
    }

    const { angle, hypotenuse } = this.linkAngleHypotenuse(source, target)
    const clippedHypotenuse = this.linkClipHypotenuseFromTarget(
      target,
      hypotenuse
    )

    // Compute transformed x-coordinate
    const newXDiff = Math.cos(angle) * clippedHypotenuse
    if (target.x > source.x) {
      return source.x + newXDiff
    } else {
      return source.x - newXDiff
    }
  }

  linkY2({ source, target }) {
    if (source.y === target.y) {
      return source.y
    }

    const { angle, hypotenuse } = this.linkAngleHypotenuse(source, target)
    const clippedHypotenuse = this.linkClipHypotenuseFromTarget(
      target,
      hypotenuse
    )

    // Compute transformed y-coordinate
    const newYDiff = Math.sin(angle) * clippedHypotenuse
    if (target.y > source.y) {
      return source.y + newYDiff
    } else {
      return source.y - newYDiff
    }
  }

  linkX1({ source, target }) {
    if (source.x === target.x) {
      return source.x
    }

    const { angle, hypotenuse } = this.linkAngleHypotenuse(source, target)
    const clippedHypotenuse = this.linkClipHypotenuseFromSource(
      source,
      hypotenuse
    )

    // Compute transformed x-coordinate
    const newXDiff = Math.cos(angle) * clippedHypotenuse
    if (source.x > target.x) {
      return target.x + newXDiff
    } else {
      return target.x - newXDiff
    }
  }

  linkY1({ source, target }) {
    if (source.y === target.y) {
      return source.y
    }

    const { angle, hypotenuse } = this.linkAngleHypotenuse(source, target)
    const clippedHypotenuse = this.linkClipHypotenuseFromSource(
      source,
      hypotenuse
    )

    // Compute transformed y-coordinate
    const newYDiff = Math.sin(angle) * clippedHypotenuse
    if (source.y > target.y) {
      return target.y + newYDiff
    } else {
      return target.y - newYDiff
    }
  }

  /* Collision detection */
  didNodesCollide({ source, target }) {
    // Checks the closeness of source and target, and returns a boolean
    // indicating whether the link should be visible
    const { hypotenuse } = this.linkAngleHypotenuse(source, target)
    const limit = source.radius + target.radius + this.collisionOffset
    return hypotenuse < limit
  }

  highlightNodeNeighborhood(d, element) {
    const { neighborhood = [], incidentLinks = [] } = d

    const highOpacity = 1
    const lowOpacity = 2 * this.graphOpacity - 1

    // First we lower opacity of all nodes and links
    this.node.attr('opacity', lowOpacity)
    this.link.attr('stroke-opacity', lowOpacity).attr('opacity', lowOpacity)

    // Then highlight the selected node and its neighborhood nodes and links
    select(element)
      .attr('opacity', highOpacity)
      .style('stroke', this.linkStroke)
      .attr('stroke-opacity', highOpacity)
    if (neighborhood.length) {
      const neighborNodes = selectAll(neighborhood.join(', '))
      neighborNodes.attr('opacity', highOpacity)

      const neighborLinks = selectAll(incidentLinks.join(', '))
      neighborLinks
        .attr('stroke-opacity', highOpacity)
        .attr('opacity', highOpacity)
    }
  }

  /* Mouse events for nodes */
  mouseenter(element, event, d) {
    this.mouseleft = false

    if (this.vue.touchInterface || !this.isDragging) {
      // we always show the tooltip on touch interfaces
      // since dragstarted is called before mouseenter
      // in that case (at least in Chrome)
      window.setTimeout(() => {
        if (!this.mouseleft) {
          this.vue.setSelectedNode(
            this.vue.graphData.nodes.find((n) => n.slug === d.slug)
          )
          this.vue.showTooltip()
          if (!this.vue.touchInterface)
            this.vue.$nextTick(() => {
              this.vue.updateTooltipPosition(event)
            })
        }
      }, 250)
    }

    if (!this.isDragging) {
      this.highlightNodeNeighborhood(d, element)
    }
  }

  mousemove(element, event, d) {
    if (!this.vue.touchInterface && !this.isDragging) {
      // const position = this.pointerPosition(event)
      // console.log(position, event.clientX, event.clientY)
      this.vue.updateTooltipPosition(event)
    }
  }

  mouseleave(element, event, d) {
    this.mouseleft = true

    if (!this.isDragging) {
      this.vue.hideTooltip()

      const { nodeStroke, linkStroke, graphOpacity } = this
      this.node
        .attr('stroke', (d) => (d.imgNotFound ? linkStroke : nodeStroke))
        .attr('stroke-opacity', (d) => (d.imgNotFound ? graphOpacity : 0))
        .attr('opacity', graphOpacity)
      this.link
        .attr('stroke-opacity', graphOpacity)
        .attr('opacity', graphOpacity)
    }
  }

  /* Drag events for nodes */
  dragstarted(element, event, d) {
    this.isDragging = true
    if (!event.active) {
      this.simulation.alphaTarget(0.3).restart()
    }

    d.fx = d.x
    d.fy = d.y
  }

  dragged(element, event, d) {
    d.fx = event.x
    d.fy = event.y
    // Hide the info tooltip on drag
    // Note: better to hide here than in dragstarted()
    // since it is called when touching a node on touch interfaces
    this.vue.hideTooltip()
    // 'grabbing' cursor only appears after releasing mouse on Chrome
    // select(element).style('cursor', 'grabbing')
  }

  dragended(element, event, d) {
    this.isDragging = false
    if (!event.active) {
      this.simulation.alphaTarget(0)
    }
    d.fx = null
    d.fy = null

    // select(element).style('cursor', 'grab')
  }

  /* Node grouping and voronoi diagram functions */
  setVoronoiExtent(transform) {
    // Compute new voronoi extent based on the zoom transform
    // k is the scale, x and y are axes translations
    const { k, x, y } = transform

    // Get initial extent from the <svg> viewBox attribute
    const [minX, minY, width, height] = this.getSVGViewBox()
    const maxX = minX + width
    const maxY = minY + height

    // Compute new extent
    const extentTransformed = [
      minX / k - x / k,
      minY / k - y / k,
      maxX / k - x / k,
      maxY / k - y / k,
    ]

    this.voronoiExtent = extentTransformed
  }

  createVoronoi() {
    return Delaunay.from(
      this.simulation.nodes(),
      (d) => d.x,
      (d) => d.y
    ).voronoi(this.voronoiExtent)
  }

  renderVoronoi() {
    const voronoi = this.createVoronoi()
    this.voronoiCell.attr('d', (d, i) => voronoi.renderCell(i))
  }

  voronoiColor(nodeGroup, d) {
    const { colorMaps: cmap } = this.vue
    if (d.sciper) {
      return cmap.bipartition.lecturers.color
    }
    if (d.neighborhoodKey) {
      // group neighborhood nodes together
      return cmap.neighborhood[d.neighborhoodKey].color
    }
    return this.vue.$nodeVoronoiColor(cmap, nodeGroup, d)
  }

  updateVoronoi(nodes, nodeGroup) {
    const getColor = this.voronoiColor.bind(this, nodeGroup)

    this.voronoiCell = this.voronoiCell
      .data(nodes, (d) => `cell-${nodeGroup}-${d.slug}`)
      .join('path')
      .attr('fill', getColor)
      .attr('stroke', 'white')
      .attr('opacity', this.graphOpacityVoronoi)
      .attr('stroke-width', 1)
  }

  resetVoronoiGrouping(nodeGroup) {
    if (nodeGroup) {
      this.updateVoronoi(this.simulation.nodes(), nodeGroup)

      // Initial cell rendering, after that rendered on each simulation tick
      this.renderVoronoi()
    } else {
      // No grouping applied, skip rendering voronoi
      this.updateVoronoi([])
    }
  }

  groupNodes(nodeGroup) {
    // Moves nodes closer to group on each simulation tick
    const alpha = this.simulation.alpha()
    const coords = {}

    // Sort the nodes' coordinates into groups:
    const groupCounts = {}
    this.node.each(({ x, y, [nodeGroup]: p, neighborhoodKey }) => {
      const key = neighborhoodKey || p
      if (!(key in coords)) {
        coords[key] = []
        groupCounts[key] = 0
      }

      groupCounts[key]++
      coords[key].push({ x, y })
    })

    // Compute the centroid of each group:
    const centroids = {}

    Object.entries(coords).forEach(([group, groupNodes]) => {
      const n = groupNodes.length

      const [tx, ty] = groupNodes.reduce(
        ([accX, accY], { x, y }) => [accX + x, accY + y],
        [0, 0]
      )

      const cx = tx / n
      const cy = ty / n

      centroids[group] = { cx, cy }
    })

    // Don't modify points close to the group centroid:
    // Heuristic method to control group density
    const dists = Object.fromEntries(
      Object.keys(coords).map((key) => {
        let dist = Math.min(10 + groupCounts[key], 50)
        if (alpha < 0.1) {
          dist += dist * 100 * (0.1 - alpha)
        }

        return [key, dist]
      })
    )

    // adjust each point if needed towards group centroid:
    this.node.each((d) => {
      const { [nodeGroup]: p, neighborhoodKey, x, y } = d
      const key = neighborhoodKey || p
      const { cx, cy } = centroids[key]
      const dx = cx - x
      const dy = cy - y

      // distance from centroid
      const r = Math.sqrt(dx * dx + dy * dy)

      if (r > dists[key]) {
        d.x = x * 0.9 + cx * 0.1
        d.y = y * 0.9 + cy * 0.1
      }
    })
  }

  /* Event handler for simulation tick event */
  ticked() {
    const { nodeGroup } = this.vue.controls
    if (nodeGroup) {
      // Only group if grouping is applied
      this.groupNodes(nodeGroup)
      this.renderVoronoi()
    }
    let linkSelection = this.link
    if (this.transitionLinks) {
      linkSelection = linkSelection.transition(getTransition())
      // ticked() called only once since alpha === 0
      this.transitionLinks = false
    }
    linkSelection
      .attr('x1', this.linkX1.bind(this))
      .attr('y1', this.linkY1.bind(this))
      .attr('x2', this.linkX2.bind(this))
      .attr('y2', this.linkY2.bind(this))
      .attr('stroke', this.linkStroke)

    if (this.vue.isDirectedGraph) {
      // only check collisions if graph is directed
      this.link.style('markerend', (d, i, group) => {
        const collision = this.didNodesCollide(d)
        if (collision) {
          // remove stroke of link on collision
          select(group[i]).attr('stroke', null)
          return null
        }
        return this.arrowMarkerUrl
      })
    }

    this.node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)
  }

  /* Render */
  renderLinks(links) {
    let strokeWidth = 1
    if (this.vue.isSimilarityGraph) {
      strokeWidth = (d) => 4 * d.similarity
    }
    this.link = this.link
      .data(links, (d) => d.id)
      .join(
        (enter) => enter.append('line'),
        (update) => update,
        (exit) =>
          exit.call((exit) =>
            exit
              .transition(getTransition())
              .attr('stroke-opacity', 0)
              .attr('opacity', 0)
              .remove()
          )
      )
      .attr('class', 'link')
      .attr('id', (d) => d.id)
      .attr('stroke', this.linkStroke)
      .attr('stroke-opacity', 1)
      .attr('opacity', 1)
      .style('stroke-width', strokeWidth)

    if (this.vue.isDirectedGraph) {
      this.link.style('marker-end', this.arrowMarkerUrl)
    } else {
      this.link.style('marker-end', null)
    }
  }

  func(func) {
    // Returns a generic handler function for d3 callbacks,
    // that when envoked calls a given handler function,
    // and passes the `this` context
    // as its first argument, which in d3 is usually the relevant DOM element.
    // That way we allow `this` inside the class instance method
    // to still refer to the class instance,
    // while also having access to the DOM element.
    const self = this
    return function (...args) {
      // `this` in this scope refers to the corresponding DOM element
      // The class instance (self) will become the `this` in the new context
      self[func](this, ...args)
    }
  }

  loadImg(imageEl, d) {
    const { sciper } = d
    if (!sciper) {
      imageEl.setAttribute('href', this.vue.$defaultProfileImg)
    } else {
      const href = this.vue.$peopleImgURL(sciper)

      imageEl.addEventListener(
        'error',
        () => {
          d.imgNotFound = true
        },
        { once: true }
      )

      imageEl.addEventListener(
        'load',
        () => {
          window.setTimeout(
            () =>
              select(`#sciper-${sciper}`)
                .attr('fill', `url(#lecturer-img-${sciper})`)
                .attr('stroke', this.nodeStroke)
                .attr('stroke-opacity', 0),
            Math.max(2000, this.node.nodes().length * 3)
          )
        },
        { once: true }
      )
      imageEl.setAttribute('href', href)
    }
  }

  renderNodes(nodes) {
    this.node = this.node
      .data(nodes, (d) => d.slug)
      .join(
        (enter) =>
          enter
            .append('circle')
            .call((enter) =>
              enter
                .transition(getTransition())
                .attr('fill', this.computeNodeFill.bind(this))
                .attr('r', this.nodeRadius.bind(this))
            ),
        (update) =>
          update.call((update) =>
            update
              // compute node fill and radius in case new parameter is given
              .transition(getTransition())
              .attr('fill', this.computeNodeFill.bind(this))
              .attr('r', this.nodeRadius.bind(this))
          ),
        (exit) =>
          exit
            .attr('fill', 'red')
            .call((exit) =>
              exit.transition(getTransition()).attr('r', 0).remove()
            )
      )
      .attr('class', 'node')
      .attr('id', (d) => d.slug)
      .attr('cursor', 'pointer')
      .attr('stroke', (d) => (d.sciper ? this.linkStroke : this.nodeStroke))
      .attr('stroke-opacity', (d) => (d.sciper ? this.graphOpacity : 0))
      .attr('stroke-width', this.nodeStrokeWidth)
      .attr('opacity', this.graphOpacity)

    this.node
      .call(
        drag()
          .on('start', this.func('dragstarted'))
          .on('drag', this.func('dragged'))
          .on('end', this.func('dragended'))
      )
      .on('mouseenter', this.func('mouseenter'))
      .on('mousemove', this.func('mousemove'))
      .on('mouseleave', this.func('mouseleave'))

    if (!this.vue.touchInterface) {
      this.node.on('dblclick', (event, d) => {
        if (d.code) {
          this.vue.$router.push(`/course/${d.slug}`)
        }
      })
    }

    if (this.vue.isBipartiteGraph) {
      this.lecturerImages
        .data([{ sciper: null }].concat(nodes.filter((d) => d.sciper)))
        .join('pattern')
        .attr('id', (d) => `lecturer-img-${d.sciper}`)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', this.lecturerImageViewBox)
        .append('image')
        .attr('width', this.lecturerImageWidth)
        .attr('height', this.lecturerImageHeight)
        .each(this.func('loadImg'))
    }
  }

  resetSimulation(nodes, links, nodeGroup) {
    // Set simulation's nodes
    this.simulation.nodes(nodes)
    // Associate links to the link force
    this.simulation.force('link').links(links)

    if (nodeGroup) {
      // Set different strengths and distances if grouping is applied
      this.simulation
        .force('link')
        .distance(({ source, target }) => {
          if (source[nodeGroup] === target[nodeGroup]) {
            return 70
          }
          return 120
        })
        .strength(({ source, target }) => {
          if (source[nodeGroup] === target[nodeGroup]) {
            // stronger link for links within a group
            return 1
          }

          // weaker links for links across groups
          return 0.1
        })

      this.simulation.force('charge').strength(-400)
      this.simulation.force('x').strength(0.01)
      this.simulation.force('y').strength(0.01)
    } else {
      // Defaults
      this.simulation
        .force('link')
        .strength(this.defaultForceLinkStrength)
        .distance(this.defaultForceLinkDistance)
      this.simulation.force('charge').strength(this.defaultForceChargeStrength)
      this.simulation.force('x').strength(this.defaultForceXYStrength)
      this.simulation.force('y').strength(this.defaultForceXYStrength)
    }
  }

  restartSimulation(alpha) {
    const currentAlpha = this.simulation.alpha()
    this.transitionLinks = false
    if (alpha === 0 && currentAlpha < 0.04) {
      // if alpha === 0 and the simulation has (nearly) cooled down
      // we want to restart without reheating the simulation
      // --> apply a smooth transition to the links
      this.transitionLinks = true
      // restart() calls tick() once when alpha === 0
      this.simulation.alpha(alpha).restart()
    } else if (alpha > 0) {
      // else if alpha > 0, restart the simulation without links transition
      this.simulation.alpha(alpha).restart()
    }
  }

  render({ nodes: n, links: l }, alpha = 1) {
    // Make a shallow copy to protect against mutation, while
    // recycling old nodes to preserve position and velocity.
    const old = new Map(this.node.data().map((d) => [d.slug, d]))
    const nodes = n.map((d) => Object.assign(old.get(d.slug) || {}, d))
    const links = l.map((d) => Object.assign({}, d))

    this.renderLinks(links)
    this.renderNodes(nodes)
    const { nodeGroup } = this.vue.controls

    this.resetVoronoiGrouping(nodeGroup)
    this.resetSimulation(nodes, links, nodeGroup)
    this.restartSimulation(alpha)

    // Set initial scale depending on the number of nodes in the graph
    // + 2 to avoid division by zero in case
    // there is zero or one node since log(1) === 0
    this.initialScale = 2 / Math.log(nodes.length + 2)

    this.collisionOffset = this.nodeStrokeWidth

    if (this.vue.isDirectedGraph) {
      this.collisionOffset += this.arrowMarkerWidth
    }
  }
}
