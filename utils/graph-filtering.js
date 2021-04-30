// creates id selector
const sel = (id) => `#${id}`

function subgraphNodesTreeviewFilter(nodes, treeview) {
  const matchedSlugs = new Set(treeview.flatMap(({ courses: c }) => c))
  return nodes.filter(({ slug }) => matchedSlugs.has(slug))
}

function subgraphNodesMultiselectFilter(nodes, multiselects) {
  return nodes.filter((c) =>
    Object.entries(multiselects).every(
      ([key, values]) => !values.length || values.includes(c[key])
    )
  )
}

function filterDirectedGraph(g, subgraphNodes) {
  const ids = subgraphNodes.map((c) => c.slug)

  // Compute incoming, outgoing, and subgraph links
  const incomingLinksFiltered = g.links.incoming.filter(({ target: t }) =>
    ids.includes(t)
  )
  const outgoingLinksFiltered = g.links.outgoing.filter(({ source: s }) =>
    ids.includes(s)
  )
  const [
    subgraphLinks,
    incomingLinksExtra,
    outgoingLinksExtra,
  ] = g.links.subgraph.reduce(
    ([subgraph, incoming, outgoing], l) => {
      if (ids.includes(l.source) && ids.includes(l.target)) {
        // Link is between nodes in the subgraph
        return [[...subgraph, l], incoming, outgoing]
      } else if (!ids.includes(l.source) && ids.includes(l.target)) {
        // Ingoing links do not have the source node in the subgraph
        return [subgraph, [...incoming, l], outgoing]
      } else if (ids.includes(l.source) && !ids.includes(l.target)) {
        // Outgoing links do not have the target node in the subgraph
        return [subgraph, incoming, [...outgoing, l]]
      } else {
        // Not a match
        return [subgraph, incoming, outgoing]
      }
    },
    [[], [], []]
  )
  const incomingLinks = incomingLinksFiltered.concat(incomingLinksExtra)
  const outgoingLinks = outgoingLinksFiltered.concat(outgoingLinksExtra)

  // Compute incoming, outgoing, and incoming/outgoing nodes
  const subgraphRemoved = g.nodes.subgraph.filter((c) => !ids.includes(c.slug))

  const incomingLinksSource = incomingLinks.map(({ source }) => source)
  const outgoingLinksTarget = outgoingLinks.map(({ target }) => target)

  const [incomingNodes, outgoingNodes, incomingOutgoingNodes] = [
    ...subgraphRemoved,
    ...g.nodes.incoming,
    ...g.nodes.outgoing,
    ...g.nodes.incomingOutgoing,
  ].reduce(
    ([incoming, outgoing, incomingOutgoing], n) => {
      if (
        // either node is in subgraphRemoved (neither incoming nor outgoing)
        // or in g.nodes.incomingOutgoingNodes
        n.incoming === n.outgoing &&
        // node is an incoming and an outgoing neighbor
        incomingLinksSource.includes(n.slug) &&
        outgoingLinksTarget.includes(n.slug)
      ) {
        return [
          incoming,
          outgoing,
          [
            ...incomingOutgoing,
            {
              ...n,
              incoming: true,
              outgoing: true,
              neighborhoodKey: 'incomingOutgoing',
            },
          ],
        ]
      } else if (
        // node is in subgraphRemoved or outgoingNodes, and it is an outgoing neighbor
        !n.incoming &&
        outgoingLinksTarget.includes(n.slug)
      ) {
        return [
          incoming,
          [
            ...outgoing,
            {
              ...n,
              incoming: false,
              outgoing: true,
              neighborhoodKey: 'outgoing',
            },
          ],
          incomingOutgoing,
        ]
      } else if (
        // node is in subgraphRemoved or incomingNodes, and it is an incoming neighbor
        !n.outgoing &&
        incomingLinksSource.includes(n.slug)
      ) {
        return [
          [
            ...incoming,
            {
              ...n,
              incoming: true,
              outgoing: false,
              neighborhoodKey: 'incoming',
            },
          ],
          outgoing,
          incomingOutgoing,
        ]
      } else {
        // no match
        return [incoming, outgoing, incomingOutgoing]
      }
    },
    [[], [], []]
  )

  return {
    nodes: {
      subgraph: subgraphNodes,
      incoming: incomingNodes,
      outgoing: outgoingNodes,
      incomingOutgoing: incomingOutgoingNodes,
    },
    links: {
      subgraph: subgraphLinks,
      incoming: incomingLinks,
      outgoing: outgoingLinks,
    },
  }
}

function filterDirectedGraphNeighborhoods(
  graphFiltered,
  { incomingSwitch: i, outgoingSwitch: o }
) {
  const g = JSON.parse(JSON.stringify(graphFiltered))

  if (!i && !o) {
    g.nodes.incomingOutgoing = []
  }

  if (!i) {
    g.nodes.incoming = []
    g.links.incoming = []
  }

  if (!o) {
    g.nodes.outgoing = []
    g.links.outgoing = []
  }

  return g
}

function flattenDirectedGraph(g) {
  const nodes = Object.values(g.nodes)
    .flat()
    .sort((a, b) => (a.code > b.code ? 1 : -1))
  const links = Object.values(g.links).flat()
  return { nodes, links }
}

function createBipartiteGraph(subgraphNodes) {
  const courses = []
  const lecturers = []
  const links = []
  subgraphNodes.forEach((course) => {
    course.lecturers.forEach((lecturer) => {
      const slug = `sciper-${lecturer.sciper}`
      lecturers.push({
        ...lecturer,
        bipartition: 'lecturers',
        // node id is the slug property
        slug,
      })
      links.push({
        source: course.slug,
        target: slug,
        id: `${course.slug}--${lecturer.sciper}`,
      })
    })
    courses.push({
      ...course,
      bipartition: 'courses',
    })
  })
  return {
    nodes: {
      courses: courses.sort((a, b) => (a.slug > b.slug ? 1 : -1)),
      lecturers: lecturers.sort((a, b) => (a.name > b.name ? 1 : -1)),
    },
    links,
  }
}

function processGraph(g) {
  const nodes = Object.fromEntries(
    g.nodes.map((n) => [
      n.slug,
      {
        ...n,
        degree: 0,
        inDegree: 0,
        outDegree: 0,
        neighborhood: [],
        incidentLinks: [],
      },
    ])
  )

  const links = g.links.filter((l) => l.source in nodes && l.target in nodes)

  // Compute degrees and neighborhoods
  links.forEach(({ source: s, target: t, id }) => {
    nodes[s].degree += 1
    nodes[t].degree += 1
    nodes[t].inDegree += 1
    nodes[s].outDegree += 1
    nodes[s].neighborhood.push(sel(t))
    nodes[t].neighborhood.push(sel(s))
    nodes[s].incidentLinks.push(sel(id))
    nodes[t].incidentLinks.push(sel(id))
  })

  return { nodes: Object.values(nodes), links }
}

export default {
  subgraphNodesTreeviewFilter,
  subgraphNodesMultiselectFilter,
  filterDirectedGraph,
  filterDirectedGraphNeighborhoods,
  flattenDirectedGraph,
  createBipartiteGraph,
  processGraph,
}
