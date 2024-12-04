import React, { Component, Fragment } from 'react';
import Grid from './components/layout/Grid';
import { FishboneDrawer } from './components/fishbone/FishboneDrawer';
import './style.css';

// Interface definitions
interface Cause {
  name: string;
  children?: Cause[];
}

interface FishboneChartData {
  title?: string;
  children?: Cause[];
}

interface FishboneChartProps {
  cols?: string;
  data: FishboneChartData | null;
  loaderTime: number;
  hasLoader: boolean;
}

interface FishboneChartState {
  data: FishboneChartData | null;
  index: number;
  isLoading: boolean
}

class FishboneChart extends Component<FishboneChartProps, FishboneChartState> {
  // Static default props
  static defaultProps = {
    cols: '12',
    hasLoader: true,
    loaderTime: 500,
  };

  // Initial state
  state: FishboneChartState = {
    data: null,
    index: 0,
    isLoading: true,
  };

  componentWillMount() {
    this.setState({data: this.props.data, isLoading: true });
  } 

  // Lifecycle method to update state when props change
  componentDidUpdate(prevProps: FishboneChartProps ) {
    if (this.props.data !== prevProps.data) {
      this.setState({ data: this.props.data });
      this.initFishbone();
    }
  }

  // Lifecycle method to initialize fishbone and add resize listener
  componentDidMount() {
    this.setState({ data: this.props.data });
    this.initFishbone();
    window.addEventListener('resize', this.handleResize);
  }

  // Cleanup method to remove resize listener
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  // Method to initialize fishbone
  initFishbone = ():void => {
    new FishboneDrawer().init();
    this.handleLoader();
  };

  handleLoader = () :void =>  {
    this.setState({ isLoading: true });
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, this.props.loaderTime || 500);
  }

  // Resize handler
  handleResize = ():void => {
    this.initFishbone();
  };

  // Color selection method
  getColor = (index: number): string => {
    const colors = [
      'blue',
      'pink',
      'gray',
      'green',
      'blue_two',
      'orange',
      'black',
      'purple',
    ];
    return colors[index % colors.length];
  };

  // Render causes method
  renderCauses = (children: Cause[] | null, isTop: boolean): JSX.Element[] | null => {
    if (!Array.isArray(children)) return null;

    const midPoint = Math.floor(children.length / 2);
    const causesArray = isTop ? children.slice(0, midPoint) : children.slice(midPoint);
    const color = this.getColor(this.state.index);

    return causesArray.map((cause, index) => (
      <div key={`${isTop ? 'top' : 'bottom'}_causes_${cause.name}_${index}`} className="causeContent">
        {isTop && <div className={`cause top ${color}_ ${color}Border`}>{cause.name}</div>}
        <div className={`causeAndLine ${isTop ? 'top-items' : 'bottom-items'}`}>
          {this.renderSubCauses(cause.children || [])}
          <div className={`diagonalLine ${color}${isTop ? 'TopBottom' : 'BottomTop'}`} />
        </div>
        {!isTop && <div className={`cause bottom ${color}_ ${color}Border`}>{cause.name}</div>}
      </div>
    ));
  };

  // Render sub-causes method
  renderSubCauses = (subCauses: Cause[] | null): JSX.Element | null => {
    return (<div className='rootCauses'>{
      Array.isArray(subCauses) ? subCauses.map((subCause, index) => (
        <div className="cuseContainer" key={`root_causes_${subCause.name}_${index}`}>
          <span className="cause top gray_ blueBorder lineEffect bold">{subCause.name}</span>
          <div className="blueBorder absoluteBorder" />
          <div className="subcauses-list-container">
            <ul className="subcauses-list">
              {Array.isArray(subCause.children)
                ? subCause.children.map((_subCause, idx) => (
                  <li key={`sub_causes_${idx}_${_subCause.name}`}>{_subCause.name}</li>
                ))
                : null}
            </ul>
          </div>
        </div>
      )) : null
    }</div>);
  };

  // Get causes method
  getCauses = (): JSX.Element => {
    const { children = [] } = this.state.data || {};

    return (
      <div className="causes">
        <div className="causesGroup top-group">{this.renderCauses(children, true)}</div>
        <div className={`lineEffect ${this.getColor(this.state.index)}Border`} />
        <div className="causesGroup bottom-group">{this.renderCauses(children, false)}</div>
      </div>
    );
  };

  // Get effect method
  getEffect = (): JSX.Element => (
    <div className={`effect ${this.getColor(this.state.index)}Border`} id="effectTitleContainer">
      <div className="effectValue">
        {(this.state.data && this.state.data.title && this.state.data.title.length)
          ? this.state.data.title
          : ''}
      </div>
    </div>
  );

  // Render method
  render() {
    const { cols, hasLoader } = this.props;

    if (!this.state.data) {
      return <Fragment>No Data Received</Fragment>;
    }

    return (
      <Grid cols={cols}>
        <div className="fishboneChart">
          {this.getCauses()}
          {this.getEffect()}
        </div>
        {
          (hasLoader && this.state.isLoading) ? <div className="fishbon-chart-overlay">
          <div className="fishbon-chart-loader"></div>
        </div> : null
        }
      </Grid>
    );
  }
}

export default FishboneChart;