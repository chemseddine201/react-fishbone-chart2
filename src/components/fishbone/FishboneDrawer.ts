export class FishboneDrawer {
    private topSelector: string;
    private bottomSelector: string;
    private causesSelector: string;
    private lineSelector: string;
    private containerSelector: string;
    private borderSelector: string;
    private titleSelector: string;
    private topCausesContainerSelector: string;

    constructor() {
        this.topSelector = '.causeAndLine.top-items';
        this.bottomSelector = '.causeAndLine.bottom-items';
        this.causesSelector = '.rootCauses';
        this.lineSelector = '.diagonalLine';
        this.containerSelector = '.cuseContainer';
        this.borderSelector = '.absoluteBorder';
        this.titleSelector = '.effectValue';
        this.topCausesContainerSelector = '.top-group';
    }

    /**
     * Initialize the fishbone diagram with sequential and error-handled steps
     * @returns {void}
     */
    init(): void {
        this.drawTopItems();
        this.drawBottomItems();
        this.fixTitlePosition();
    }

    /**
     * Draw top items of the fishbone diagram
     * @returns {void}
     */
    drawTopItems(): void {
        const topItems = document.querySelectorAll<HTMLElement>(this.topSelector);
        if (topItems.length === 0) {
            console.warn('No top items found');
            return;
        }
        this.processItems(topItems, false);
    }

    /**
     * Draw bottom items of the fishbone diagram
     * @returns {Promise<void>}
     */
    async drawBottomItems(): Promise<void> {
        const bottomItems = document.querySelectorAll<HTMLElement>(this.bottomSelector);
        if (bottomItems.length === 0) {
            console.warn('No bottom items found');
            return;
        }
        this.processItems(bottomItems, true);
    }

    /**
     * Process items for positioning
     * @param {NodeListOf<HTMLElement>} items - Items to process
     * @param {boolean} isBottom - Whether these are bottom items
     */
    private processItems(items: NodeListOf<HTMLElement>, isBottom: boolean): void {
        if (!items || items.length === 0) return;

        items.forEach(item => {
            const rootCauses = item.querySelector<HTMLElement>(this.causesSelector);
            const diagonalLine = item.querySelector<HTMLElement>(this.lineSelector);
            
            if (!rootCauses || !diagonalLine) {
                console.warn('Missing root causes or diagonal line', { item, rootCauses, diagonalLine });
                return;
            }

            const lineWidth = diagonalLine.getBoundingClientRect().width;
            const containers = rootCauses.querySelectorAll<HTMLElement>(this.containerSelector);
            
            if (!containers || containers.length === 0) {
                console.warn('No containers found', { rootCauses });
                return;
            }

            this.adjustContainerAlignment(rootCauses, containers.length);
            this.positionContainers(containers, lineWidth, isBottom);
        });
    }

    /**
     * Adjust container alignment based on number of items
     * @param {HTMLElement} rootCauses - Root causes container
     * @param {number} itemCount - Number of items
     */
    private adjustContainerAlignment(rootCauses: HTMLElement, itemCount: number): void {
        rootCauses.style.justifyContent = itemCount === 1 ? 'center' : '';
    }

    /**
     * Position containers along the diagonal line
     * @param {NodeListOf<HTMLElement>} containers - Containers to position
     * @param {number} lineWidth - Width of the diagonal line
     * @param {boolean} isBottom - Whether these are bottom containers
     */
    private positionContainers(containers: NodeListOf<HTMLElement>, lineWidth: number, isBottom: boolean): void {
        const totalItems = containers.length;
        const isMultipleItems = totalItems > 2;
        const divisor = isMultipleItems ? 2 : 3;

        containers.forEach((container, index) => {
            const itemWidth = container.getBoundingClientRect().width;
            const absoluteBorder = container.querySelector(this.borderSelector);
            
            if (!absoluteBorder) {
                console.warn('No absolute border found for container', { container });
                return;
            }

            this.setContainerStyles(container, absoluteBorder as HTMLElement, {
                itemWidth,
                lineWidth,
                index,
                totalItems,
                divisor,
                isBottom
            });
        });
    }

    /**
     * Set styles for individual containers
     * @param {HTMLElement} container - Container element
     * @param {HTMLElement} border - Border element
     * @param {Object} config - Configuration for positioning
     */
    private setContainerStyles(container: HTMLElement, border: HTMLElement, config: {
        itemWidth: number;
        lineWidth: number;
        index: number;
        totalItems: number;
        divisor: number;
        isBottom: boolean;
    }): void {
        const { itemWidth, lineWidth, index, totalItems, divisor, isBottom } = config;

        Object.assign(border.style, {
            left: `${itemWidth}px`,
            width: `${lineWidth}px`
        });

        let position = 0;
        if (totalItems > 1) {
            position = Math.floor((index / (totalItems - 1)) * (lineWidth / divisor));
        }

        Object.assign(container.style, {
            position: 'relative',
            left: isBottom ? `${(lineWidth / 2) - position}px` : `${position}px`
        });
    }

    /**
     * Fix the position of the title
     * @returns {void}
     */
    fixTitlePosition(): void {
        const topCausesContainer = document.querySelector<HTMLElement>(this.topCausesContainerSelector);
        const title = document.querySelector<HTMLElement>(this.titleSelector);
        
        if (!topCausesContainer) {
            console.warn('Top causes container not found');
            return;
        }

        if (!title) {
            console.warn('Title element not found');
            return;
        }

        const boundaries = topCausesContainer.getBoundingClientRect();
        const titleBoundaries = title.getBoundingClientRect();
        
        const yPosition = boundaries.height - (titleBoundaries.height / 2);
        title.style.top = `${yPosition}px`;
    }
}