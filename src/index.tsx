import React, { Component, Fragment } from 'react'
import Grid from './components/layout/Grid'
import { FishboneDrawer } from './components/fishbone/FishboneDrawer'
import './assets/style.css'

//supported colors 'blue', 'pink', 'gray', 'green', 'blue_two', 'orange', 'black', 'purple'
// Interface definitions

//type ColorName = 'blue' | 'pink' | 'gray' | 'green' | 'blue_two' | 'orange' | 'black' | 'purple'
type CauseAlignment  = 'start' | 'center';
interface ColorMap {
  [key: string]: string
}

interface Cause {
  name: string
  children?: Cause[]
  id?: string | number  // Added ID for item identification
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
  color: string
  showSkeleton: boolean
  alignment: CauseAlignment
  mainProblemBackground: boolean
  causeCategoryBackground: boolean
  causeBackground: boolean
  onReady?: () => void  // Added onReady callback
  onError?: (error: Error) => void  // Error handling
  customColors?: ColorMap  // Allow custom colors beyond defaults
  onCauseClick?: (cause: Cause) => void  // Interaction callback
  renderCustomCause?: (cause: Cause, isTop: boolean) => React.ReactNode  // Custom rendering
  maxHeight?: number  // Control max height size
  maxWidth?: number   // Control max width size
  className?: string  // Custom styling class
  customLoaderComponent?: React.ReactNode  // Custom loader component
  debug?: boolean     // Debug mode
  disableResize?: boolean  // Control resize behavior
  animationDuration?: number  // Control animation speed
  onInitStart?: () => void  // Lifecycle hook before initiation of fishbone
  onInitEnd?: () => void    // Lifecycle hook after fishbone initiate
}

interface FishboneChartState {
  data: FishboneChartData | null
  color: string
  isLoading: boolean
  showSkeleton: boolean
  hasLoader: boolean
  alignment: CauseAlignment
  mainProblemBackground: boolean
  causeCategoryBackground: boolean
  causeBackground: boolean
  isInitialized: boolean  // Track initialization state
  error: Error | null     // Track errors
  customColors: ColorMap  // Store custom colors
}

class FishboneChart extends Component<FishboneChartProps, FishboneChartState> {
  // Static default props
  static defaultProps = {
    cols: '12',
    hasLoader: true,
    loaderTime: 500,
    color: 'blue',
    showSkeleton: true,
    alignment: 'start',
    mainProblemBackground: false,
    causeCategoryBackground: false,
    causeBackground: false,
    debug: false,
    disableResize: false,
    animationDuration: 300
  }

  // Initial state
  state: FishboneChartState = {
    data: null,
    color: 'blue',
    isLoading: true,
    showSkeleton: true,
    hasLoader: true,
    alignment: 'start',
    mainProblemBackground: false,
    causeCategoryBackground: false,
    causeBackground: false,
    isInitialized: false,
    error: null,
    customColors: {}
  }

  // Component references
  private fishboneContainer = React.createRef<HTMLDivElement>();
  private resizeObserver: ResizeObserver | null = null;

  // Lifecycle method to update state when props change
  componentDidUpdate(prevProps: FishboneChartProps) {
    // Check if data has actually changed before updating
    if (!this.isEqual(prevProps.data, this.props.data)) {
      this.setState({ data: this.props.data }, () => {
        this.initFishbone();
      });
    }

    // Check other important props that might require re-initialization
    if (prevProps.color !== this.props.color ||
        prevProps.alignment !== this.props.alignment ||
        prevProps.mainProblemBackground !== this.props.mainProblemBackground ||
        prevProps.causeCategoryBackground !== this.props.causeCategoryBackground ||
        prevProps.causeBackground !== this.props.causeBackground ||
        prevProps.customColors !== this.props.customColors) {
      this.setState({
        color: this.props.color,
        alignment: this.props.alignment,
        mainProblemBackground: this.props.mainProblemBackground,
        causeCategoryBackground: this.props.causeCategoryBackground,
        causeBackground: this.props.causeBackground,
        customColors: this.props.customColors || {}
      }, () => {
        this.initFishbone();
      });
    }
    
    // Handle resize observer updates
    if (prevProps.disableResize !== this.props.disableResize) {
      if (this.props.disableResize) {
        this.removeResizeObserver();
      } else {
        this.setupResizeObserver();
      }
    }
  }

  // Lifecycle method to initialize fishbone and add resize observer
  componentDidMount() {
    try {
      const { 
        data, 
        color, 
        showSkeleton, 
        hasLoader, 
        alignment = 'start', 
        mainProblemBackground = false,
        causeCategoryBackground = false,
        causeBackground = false,
        customColors = {}
      } = this.props
        
      this.setState(prevState => ({
        ...prevState,
        data,
        color,
        showSkeleton,
        hasLoader,
        alignment,
        mainProblemBackground,
        causeCategoryBackground,
        causeBackground,
        customColors
      }), () => {
        this.initFishbone();
      })
      
      // Set up resize handling
      if (!this.props.disableResize) {
        this.setupResizeObserver();
      } else {
        window.addEventListener('resize', this.handleResize);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  // Set up ResizeObserver for more efficient resize handling
  setupResizeObserver = () => {
    if (typeof ResizeObserver !== 'undefined' && this.fishboneContainer.current) {
      this.resizeObserver = new ResizeObserver(this.handleContainerResize);
      this.resizeObserver.observe(this.fishboneContainer.current);
    } else {
      // Fallback to window resize event
      window.addEventListener('resize', this.handleResize);
    }
  }

  removeResizeObserver = () => {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    window.removeEventListener('resize', this.handleResize);
  }

  // Handle resize with ResizeObserver for better performance
  handleContainerResize = (entries: ResizeObserverEntry[]) => {
    if (!this.state.isLoading) {
      this.initFishbone();
    }
  }

  // Cleanup method to remove resize listener
  componentWillUnmount() {
    this.removeResizeObserver();
    window.removeEventListener('resize', this.handleResize);
  }

  // Error handling method
  handleError = (error: Error) => {
    this.setState({ error });
    if (this.props.onError) {
      this.props.onError(error);
    }
    if (this.props.debug) {
      console.error('FishboneChart Error:', error);
    }
  }

  // Method to initialize fishbone
  initFishbone = (): void => {
    try {
      this.setState(prevState => ({
        ...prevState, 
        isLoading: true,
        isInitialized: false
      }))
      
      // Call onInitStart callback if provided
      if (this.props.onInitStart) {
        this.props.onInitStart();
      }
      
      const timer = setTimeout(() => {
        try {
          new FishboneDrawer().init();
          
          this.setState(prevState => ({
            ...prevState, 
            isLoading: false,
            isInitialized: true
          }), () => {
            this.handleComponentReady();
            // Call onInitEnd callback if provided
            if (this.props.onInitEnd) {
              this.props.onInitEnd();
            }
          });
        } catch (error) {
          this.handleError(error as Error);
        }
      }, this.props.loaderTime || 500)
    } catch (error) {
      this.handleError(error as Error);
    }
  }
  
  // Method to handle when component is ready
  handleComponentReady = (): void => {
    if (this.state.isInitialized && !this.state.isLoading && this.props.onReady) {
      // Use animationDuration prop for timing
      setTimeout(() => {
        if (this.props.onReady) {
          this.props.onReady();
        }
      }, this.props.animationDuration || 300);
    }
  }

  // Resize handler
  handleResize = (): void => {
    if (this.state.isLoading === false) {
      this.initFishbone();
    }
  }

  // Cause click handler
  handleCauseClick = (cause: Cause): void => {
    try {
      if (this.props.onCauseClick) {
        this.props.onCauseClick(cause);
      }
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  isEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!obj2.hasOwnProperty(key)) return false;
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        if (!this.isEqual(obj1[key], obj2[key])) return false;
      } else if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    
    return true;
  }

  getColorValue = (): string => {
    const color = this.state.color;

    const colors: ColorMap = {
      blue: '#00c0ef',
      pink: '#d81b60',
      gray: '#68738c',
      green: '#30bbbb',
      blue_two: '#0b78ce',
      orange: '#ff7701',
      black: '#111111',
      purple: '#555299',
      ...this.state.customColors  // Merge custom colors with defaults
    }

    return colors[color] ? colors[color] : 'blue';
  }

  // Render causes method
  renderCauses = (children: Cause[] | null, isTop: boolean): JSX.Element | null => {
    if (!Array.isArray(children)) return <></>

    const midPoint = Math.floor(children.length / 2)
    const causesArray = isTop ? children.slice(0, midPoint) : children.slice(midPoint)
    //fix top causes problem
    if (isTop && causesArray.length == 0) {
      return <div style={{minHeight: 300}} />
    }
    //
    return <>{
        causesArray.map((cause, index) => {
          // Use custom renderer if provided
          if (this.props.renderCustomCause) {
            return (
              <div 
                key={`${isTop ? 'top' : 'bottom'}_causes_${cause.id || cause.name}_${index}`} 
                className='causeContent'
                onClick={() => this.handleCauseClick(cause)}
              >
                {this.props.renderCustomCause(cause, isTop)}
              </div>
            );
          }
          
          return (
            <div 
              key={`${isTop ? 'top' : 'bottom'}_causes_${cause.id || cause.name}_${index}`} 
              className='causeContent'
              onClick={() => this.handleCauseClick(cause)}
            >
              {isTop && <div className={`cause top cause-${this.state.alignment} ${this.state.causeCategoryBackground ? this.state.color+'_' : ''} ${this.state.color}Border`}>{cause.name}</div>}
              <div className={`causeAndLine ${isTop ? 'top-items' : 'bottom-items'}`}>
                {this.renderSubCauses(cause.children || [])}
                <div className={`diagonalLine ${this.state.color}${isTop ? 'TopBottom' : 'BottomTop'}`} />
              </div>
              {!isTop && <div className={`cause cause-${this.state.alignment} bottom ${this.state.causeCategoryBackground ? this.state.color+'_' : ''} ${this.state.color}Border`}>{cause.name}</div>}
            </div>
          )
        })
      }
    </>
  }

  // Render sub-causes method
  renderSubCauses = (subCauses: Cause[] | null): JSX.Element | null => {
    const color = this.state.color;
    return (
      <div className='rootCauses'>
        {Array.isArray(subCauses)
          ? subCauses.map((subCause, index) => (
              <div 
                className='cuseContainer' 
                key={`root_causes_${subCause.id || subCause.name}_${index}`}
                onClick={() => this.handleCauseClick(subCause)}
              >
                <span className={`cause top cause-${this.state.alignment} ${color}Border bold ${this.state.causeBackground ? this.state.color+'_' : ''}`}>{subCause.name}</span>
                <div className={`${color}Border absoluteBorder`} />
                <div className='subcauses-list-container'>
                  <ul className={`subcauses-list-${this.state.alignment}`}>
                    {Array.isArray(subCause.children)
                      ? subCause.children.map((_subCause, idx) => (
                          <li 
                            key={`sub_causes_${idx}_${_subCause.id || _subCause.name}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              this.handleCauseClick(_subCause);
                            }}
                          >
                            {_subCause.name}
                          </li>
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
        <div className={`lineEffect thinBorder ${this.state.color}Border`} />
        <div className='causesGroup bottom-group'>{this.renderCauses(children, false)}</div>
      </div>
    )
  }

  // Get effect method
  getEffect = (): JSX.Element => {
    const title = this.state.data && this.state.data.title && this.state.data.title.length ? this.state.data.title : ''
    const colorValue = this.getColorValue();

    return (
      <div className={`main-problem ${!this.state.isLoading ? '' : 'hidden'}`}>
          {this.state.showSkeleton ? (
            <div className='main-problem-title'>
              <div className={`title absolute-tile bordered ${this.state.color+'Border'} ${this.state.mainProblemBackground ? this.state.color + '_' : ''}`} >{title}</div>
              <svg
                version='1.0'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 2600 2600'
                width='150px'
                height='150px'
              >
              </svg>
            </div>
          ) : (
            <div className={`title bordered ${this.state.color}Border ${this.state.mainProblemBackground ? this.state.color + '_' : ''}`} >{title}</div>
          )}
      </div>
    )
  }

  getFishTail = (): JSX.Element => {
    return (
      <Fragment>
        {this.state.showSkeleton ? (
          <div className={`fish-tail ${!this.state.isLoading ? '' : 'hidden'}`}>
            <svg
              className='fish-tail-svg'
              fill={this.getColorValue()}
              version='1.1'
              xmlns='http://www.w3.org/2000/svg'
              width='150px'
              height='150px'
              viewBox='0 0 572 572'
              xmlSpace='preserve'
            >
            </svg>
          </div>
        ) : null}
      </Fragment>
    )
  }

  // Render method
  render() {
    const { cols, maxHeight, maxWidth, className, customLoaderComponent } = this.props;

    // If there's an error, render error state
    if (this.state.error) {
      return (
        <div className="fishbone-error">
          <p>Error loading fishbone chart</p>
          {this.props.debug && <pre>{this.state.error.toString()}</pre>}
        </div>
      );
    }

    if (!this.state.data) {
      return <Fragment>No Data Received</Fragment>
    }

    const containerStyle = {
      maxHeight: maxHeight ? `${maxHeight}px` : undefined,
      maxWidth: maxWidth ? `${maxWidth}px` : undefined,
    };

    return (
      <Grid cols={cols}>
        <div 
          ref={this.fishboneContainer}
          className={`fishboneChart ${!this.state.isLoading ? '' : 'hidden'} ${className || ''}`}
          style={containerStyle}
        >
          {this.getFishTail()}
          {this.getCauses()}
          {this.getEffect()}
        </div>
        {this.state.hasLoader && this.state.isLoading ? (
          <div className='fishbon-chart-overlay'>
            {customLoaderComponent || <div className='fishbon-chart-loader'></div>}
          </div>
        ) : null}
      </Grid>
    )
  }
}

export default FishboneChart