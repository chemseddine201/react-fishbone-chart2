import React, { Component, ComponentProps, ComponentPropsWithRef, ReactNode } from 'react';

interface GridProps extends ComponentProps<any>{
  cols?: string;
  children?: ReactNode | ReactNode[];
}

class Grid extends Component<GridProps> {
  private toCssClasses(numbers?: string): string {
    const cols = numbers ? numbers.split(' ') : [];
    let classes = '';

    if (cols[0]) classes += `col-xs-${cols[0]}`;
    if (cols[1]) classes += ` col-sm-${cols[1]}`;
    if (cols[2]) classes += ` col-md-${cols[2]}`;
    if (cols[3]) classes += ` col-lg-${cols[3]}`;

    return classes.trim();
  }

  render() {
    const { cols, children } = this.props;
    const gridClasses = this.toCssClasses(cols);

    return (
      <div className={gridClasses}>
        {children}
      </div>
    );
  }
}

export default Grid;