import React, { Component, Fragment } from 'react'
import Grid from './components/layout/Grid'
import { FishboneDrawer } from './components/fishbone/FishboneDrawer'
import './assets/style.css'

// Interface definitions
interface Cause {
  name: string
  children?: Cause[]
}

interface FishboneChartData {
  title?: string
  children?: Cause[]
}

interface FishboneChartProps {
  cols?: string
  data: FishboneChartData | null
  loaderTime: number
  hasLoader: boolean
  colorIndex: number
  hasIcon: boolean
}

interface FishboneChartState {
  data: FishboneChartData | null
  index: number
  isLoading: boolean
  hasIcon: boolean
}

class FishboneChart extends Component<FishboneChartProps, FishboneChartState> {
  // Static default props
  static defaultProps = {
    cols: '12',
    hasLoader: true,
    loaderTime: 500,
    colorIndex: 6,
    hasIcon: true,
  }

  // Initial state
  state: FishboneChartState = {
    data: null,
    index: !isNaN(this.props.colorIndex) ? this.props.colorIndex : 6,
    isLoading: true,
    hasIcon: this.props.hasIcon,
  }

  componentWillMount() {
    this.setState({ data: this.props.data, isLoading: true })
  }

  // Lifecycle method to update state when props change
  componentDidUpdate(prevProps: FishboneChartProps) {
    if (this.props.data !== prevProps.data) {
      this.setState({ data: this.props.data })
      this.initFishbone()
    }
  }

  // Lifecycle method to initialize fishbone and add resize listener
  componentDidMount() {
    this.setState({ data: this.props.data })
    this.initFishbone()
    window.addEventListener('resize', this.handleResize)
  }

  // Cleanup method to remove resize listener
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  // Method to initialize fishbone
  initFishbone = (): void => {
    new FishboneDrawer().init()
    this.handleLoader()
  }

  handleLoader = (): void => {
    this.setState({ isLoading: true })
    setTimeout(() => {
      this.setState({ isLoading: false })
    }, this.props.loaderTime || 500)
  }

  // Resize handler
  handleResize = (): void => {
    this.initFishbone()
  }

  // Color selection method
  getColor = (index: number): string => {
    const colors = ['blue', 'pink', 'gray', 'green', 'blue_two', 'orange', 'black', 'purple']
    return colors[index % colors.length]
  }

  getColorValue = (index: number): string => {
    const colors = ['#00c0ef', '#d81b60', '#68738c', '#30bbbb', '#0b78ce', '#ff7701', '#111111', '#555299']
    return colors[index % colors.length]
  }

  // Render causes method
  renderCauses = (children: Cause[] | null, isTop: boolean): JSX.Element[] | null => {
    if (!Array.isArray(children)) return null

    const midPoint = Math.floor(children.length / 2)
    const causesArray = isTop ? children.slice(0, midPoint) : children.slice(midPoint)
    const color = this.getColor(this.state.index)

    return causesArray.map((cause, index) => (
      <div key={`${isTop ? 'top' : 'bottom'}_causes_${cause.name}_${index}`} className='causeContent'>
        {isTop && <div className={`cause top ${color}_ ${color}Border`}>{cause.name}</div>}
        <div className={`causeAndLine ${isTop ? 'top-items' : 'bottom-items'}`}>
          {this.renderSubCauses(cause.children || [])}
          <div className={`diagonalLine ${color}${isTop ? 'TopBottom' : 'BottomTop'}`} />
        </div>
        {!isTop && <div className={`cause bottom ${color}_ ${color}Border`}>{cause.name}</div>}
      </div>
    ))
  }

  // Render sub-causes method
  renderSubCauses = (subCauses: Cause[] | null): JSX.Element | null => {
    const color = this.getColor(this.state.index)
    return (
      <div className='rootCauses'>
        {Array.isArray(subCauses)
          ? subCauses.map((subCause, index) => (
              <div className='cuseContainer' key={`root_causes_${subCause.name}_${index}`}>
                <span className={`cause top ${color}Border lineEffect bold`}>{subCause.name}</span>
                <div className={`${color}Border absoluteBorder`} />
                <div className='subcauses-list-container'>
                  <ul className='subcauses-list'>
                    {Array.isArray(subCause.children)
                      ? subCause.children.map((_subCause, idx) => (
                          <li key={`sub_causes_${idx}_${_subCause.name}`}>{_subCause.name}</li>
                        ))
                      : null}
                  </ul>
                </div>
              </div>
            ))
          : null}
      </div>
    )
  }

  // Get causes method
  getCauses = (): JSX.Element => {
    const { children = [] } = this.state.data || {}

    return (
      <div className='causes'>
        <div className='causesGroup top-group'>{this.renderCauses(children, true)}</div>
        <div className={`lineEffect thinBorder ${this.getColor(this.state.index)}Border`} />
        <div className='causesGroup bottom-group'>{this.renderCauses(children, false)}</div>
      </div>
    )
  }

  // Get effect method
  getEffect = (): JSX.Element => {
    const title = this.state.data && this.state.data.title && this.state.data.title.length ? this.state.data.title : ''
    const color = this.getColor(this.state.index)
    const colorValue = this.getColorValue(this.state.index)
    return (
      <div className={`effect`}>
        <div className={this.state.hasIcon ? `effectValue` : `effectValue ${color}Border bordered`}>
          {this.state.hasIcon ? (
            <div className='svg-container'>
              <svg
                version='1.0'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 2600 2600'
                width='150px'
                height='150px'
              >
                <g
                  transform='translate(0,2600) scale(0.1,-0.1)'
                  fill={colorValue}
                  stroke='none'
                >
                  <path
                    d='M11115 23116 c-1317 -567 -2786 -2560 -4292 -5825 -1362 -2952 -2754
                -6983 -3772 -10918 -186 -719 -491 -2012 -491 -2083 0 -30 344 -344 610 -556
                1162 -929 2703 -1647 4565 -2128 2659 -686 5771 -811 8592 -346 2456 405 4519
                1226 5903 2349 252 204 530 462 530 490 0 25 -201 819 -290 1146 -968 3559
                -2450 7107 -4408 10555 -1283 2259 -2801 4475 -4133 6032 -509 595 -1011 1102
                -1290 1303 l-46 33 -37 -151 c-134 -540 -512 -1451 -941 -2267 -195 -372 -542
                -987 -551 -978 -2 2 19 170 47 374 183 1350 238 2135 188 2674 -10 108 -45
                315 -57 336 -5 9 -42 -3 -127 -40z m3330 -7315 c544 -115 902 -567 985 -1245
                14 -111 14 -404 0 -511 -87 -682 -426 -1188 -905 -1352 -106 -36 -224 -53
                -367 -53 -496 0 -911 158 -1182 451 -164 178 -274 401 -328 672 -30 146 -32
                448 -5 597 41 228 85 358 187 565 100 200 183 318 330 465 259 259 531 390
                900 434 73 9 298 -5 385 -23z'
                  />
                  <path
                    d='M14010 15243 c-198 -33 -391 -132 -530 -272 -268 -269 -382 -679
                -301 -1076 43 -210 156 -406 303 -525 72 -57 212 -129 308 -156 99 -29 413
                -26 525 4 242 65 431 227 537 459 119 264 137 688 43 1057 -25 102 -79 238
                -100 256 -10 8 -65 -60 -261 -325 -137 -185 -250 -332 -251 -328 -1 4 -36 188
                -78 408 -41 220 -80 424 -86 453 -10 52 -11 52 -47 51 -20 -1 -48 -4 -62 -6z'
                  />
                </g>
              </svg>
              <div className='absolute-tile title'>{title}</div>
            </div>
          ) : (
            <span className='title'>{title}</span>
          )}
        </div>
      </div>
    )
  }

  getFishTail = (): JSX.Element => {
    const colorValue = this.getColorValue(this.state.index)
    return (
      <Fragment>
        {this.state.hasIcon ? (
          <div className='fish-tail'>
            <svg
              className='fish-tail-svg'
              fill={colorValue}
              version='1.1'
              xmlns='http://www.w3.org/2000/svg'
              width='150px'
              height='150px'
              viewBox='0 0 572 572'
              xmlSpace='preserve'
            >
              <g>
                <g>
                  <path
                    d='M117.518,296.042l333.161,272.132c8.286,6.646,12.062,3.941,8.43-6.04l-88.442-260.049
              c-3.63-9.981-3.596-26.156,0.076-36.123l88.29-256.26c3.672-9.966-0.101-12.702-8.431-6.11L117.594,272.07
              C109.265,278.661,109.231,289.395,117.518,296.042z'
                  />
                </g>
              </g>
            </svg>
          </div>
        ) : null}
      </Fragment>
    )
  }

  // Render method
  render() {
    const { cols, hasLoader } = this.props

    if (!this.state.data) {
      return <Fragment>No Data Received</Fragment>
    }

    return (
      <Grid cols={cols}>
        <div className='fishboneChart'>
          {this.getFishTail()}
          {this.getCauses()}
          {this.getEffect()}
        </div>
        {hasLoader && this.state.isLoading ? (
          <div className='fishbon-chart-overlay'>
            <div className='fishbon-chart-loader'></div>
          </div>
        ) : null}
      </Grid>
    )
  }
}

export default FishboneChart
