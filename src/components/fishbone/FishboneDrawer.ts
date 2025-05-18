export class FishboneDrawer {
  private topSelector: string
  private bottomSelector: string
  private causesSelector: string
  private diagonalLineSelector: string
  private containerSelector: string
  private borderSelector: string
  private effectTitleIconContainerSelector: string
  private effectTitleSelector: string
  private topCausesContainerSelector: string
  private fishTailSelectorIcon: string
  private topCausesGroupSelector: string
  private bottomCausesGroupSelector: string
  private topTitlesSelector: string
  private bottomTitlesSelector: string
  private causeContentSelector: string

  constructor() {
    this.topSelector = '.causeAndLine.top-items'
    this.bottomSelector = '.causeAndLine.bottom-items'
    this.causesSelector = '.rootCauses'
    this.diagonalLineSelector = '.diagonalLine'
    this.containerSelector = '.cuseContainer'
    this.borderSelector = '.absoluteBorder'
    this.effectTitleIconContainerSelector = '.main-problem'
    this.effectTitleSelector = '.title.visible'
    this.topCausesContainerSelector = '.top-group'
    this.fishTailSelectorIcon = '.fish-tail-svg'
    this.topTitlesSelector = '.cause.top.cause-title'
    this.bottomTitlesSelector = '.cause.bottom.cause-title'
    this.topCausesGroupSelector = '.causesGroup.top-group'
    this.bottomCausesGroupSelector = '.causesGroup.bottom-group'
    this.causeContentSelector = '.causeContent'
  }

  /**
   * Initialize the fishbone diagram with sequential and error-handled steps
   * @returns {Promise<void>}
   */
  async init(): Promise<void> {
    await this.drawTopItems()
    await this.drawBottomItems()
    await this.fixTitlePosition()
    await this.fixTitlesPosition()
  }

  /**
   * Draw top items of the fishbone diagram
   * @returns {Promise<void>}
   */
  async drawTopItems(): Promise<void> {
    const topItems = document.querySelectorAll<HTMLElement>(this.topSelector)
    if (!topItems || topItems.length === 0) {
      console.warn('No top items found')
      return
    }
    await this.processItems(topItems, false)
  }

  /**
   * Draw bottom items of the fishbone diagram
   * @returns {Promise<void>}
   */
  async drawBottomItems(): Promise<void> {
    const bottomItems = document.querySelectorAll<HTMLElement>(this.bottomSelector)
    if (!bottomItems || bottomItems.length === 0) {
      console.warn('No bottom items found')
      return
    }
    await this.processItems(bottomItems, true)
  }

  /**
   * Process items for positioning
   * @param {NodeListOf<HTMLElement>} items - Items to process
   * @param {boolean} isBottom - Whether these are bottom items
   */
  private async processItems(items: NodeListOf<HTMLElement>, isBottom: boolean): Promise<void> {
    if (!items || items.length === 0) return

    items.forEach((item) => {
      const rootCauses = item.querySelector<HTMLElement>(this.causesSelector)
      const diagonalLine = item.querySelector<HTMLElement>(this.diagonalLineSelector)

      if (!rootCauses || !diagonalLine) {
        console.warn('Missing root causes or diagonal line', { item, rootCauses, diagonalLine })
        return
      }

      const lineWidth = diagonalLine.getBoundingClientRect().width
      const containers = rootCauses.querySelectorAll<HTMLElement>(this.containerSelector)

      if (!containers || containers.length === 0) {
        console.warn('No containers found', { rootCauses })
        return
      }

      this.adjustContainerAlignment(rootCauses, containers.length)
      this.positionContainers(containers, lineWidth, isBottom)
    })
  }

  /**
   * Adjust container alignment based on number of items
   * @param {HTMLElement} rootCauses - Root causes container
   * @param {number} itemCount - Number of items
   */
  private adjustContainerAlignment(rootCauses: HTMLElement, itemCount: number): void {
    rootCauses.style.justifyContent = itemCount === 1 ? 'center' : ''
  }

  /**
   * Position containers along the diagonal line
   * @param {NodeListOf<HTMLElement>} containers - Containers to position
   * @param {number} lineWidth - Width of the diagonal line
   * @param {boolean} isBottom - Whether these are bottom containers
   */
  private positionContainers(containers: NodeListOf<HTMLElement>, lineWidth: number, isBottom: boolean): void {
    const totalItems = containers.length
    const isMultipleItems = totalItems > 2
    const divisor = isMultipleItems ? 2 : 3

    containers.forEach((container, index) => {
      const itemWidth = container.getBoundingClientRect().width
      const absoluteBorder = container.querySelector(this.borderSelector)

      if (!absoluteBorder) {
        console.warn('No absolute border found for container', { container })
        return
      }

      this.setContainerStyles(container, absoluteBorder as HTMLElement, {
        itemWidth,
        lineWidth,
        index,
        totalItems,
        divisor,
        isBottom,
      })
    })
  }

  /**
   * Set styles for individual containers
   * @param {HTMLElement} container - Container element
   * @param {HTMLElement} border - Border element
   * @param {Object} config - Configuration for positioning
   */
  private setContainerStyles(
    container: HTMLElement,
    border: HTMLElement,
    config: {
      itemWidth: number
      lineWidth: number
      index: number
      totalItems: number
      divisor: number
      isBottom: boolean
    },
  ): void {
    const { itemWidth, lineWidth, index, totalItems, divisor, isBottom } = config

    Object.assign(border.style, {
      left: `${itemWidth}px`,
      width: `${lineWidth}px`,
    })

    let position = 0
    if (totalItems > 1) {
      position = Math.floor((index / (totalItems - 1)) * (lineWidth / divisor))
    }

    Object.assign(container.style, {
      position: 'relative',
      left: isBottom ? `${lineWidth / 2 - position}px` : `${position}px`,
    })
  }

  /**
   * Fix the position of the title
   * @returns {Promise<void>}
   */
  async fixTitlePosition(): Promise<void> {
    const topCausesContainer = document.querySelector<HTMLElement>(this.topCausesContainerSelector)
    const titleIconContainer = document.querySelector<HTMLElement>(this.effectTitleIconContainerSelector)
    const fishTailIcon = document.querySelector<HTMLElement>(this.fishTailSelectorIcon)
    if (!topCausesContainer) {
      return
    }

    const topCausesBoundaries = topCausesContainer.getBoundingClientRect()

    if (titleIconContainer) {
      //force display to get the boundries
      const titleIconContainerBoundaries = titleIconContainer.getBoundingClientRect()
      const yPosition = topCausesBoundaries.height - titleIconContainerBoundaries.height / 2
      titleIconContainer.style.top = `${Math.floor(yPosition)}px`
      //
      const titleContainer = titleIconContainer.querySelector<HTMLElement>(this.effectTitleSelector)
      if (titleContainer) {
        const titleHeight = titleContainer.getBoundingClientRect().height
        titleContainer.style.left = `-36px`
        titleContainer.style.top = `-${Math.floor(titleHeight)}px`
      }
    }

    if (fishTailIcon) {
      const fishTailIconBoundries = fishTailIcon.getBoundingClientRect()
      const yPosition = topCausesBoundaries.height - fishTailIconBoundries.height / 2
      fishTailIcon.style.top = `${Math.floor(yPosition) + 8}px` //8 for padding handle
    }
  }

  async fixTitlesPosition(): Promise<void> {
    //process top ones
    const topCausesGroup = document.querySelector<HTMLElement>(this.topCausesGroupSelector)
    if (topCausesGroup) {
      const topCausesContents = topCausesGroup.querySelectorAll<HTMLElement>(this.causeContentSelector)
      topCausesContents.forEach((element: HTMLElement) => {
        const movableElement = element.querySelector<HTMLElement>(this.topTitlesSelector)
        const targetElement = element.querySelector<HTMLElement>(this.diagonalLineSelector)
        if (movableElement && targetElement) {
          const movableRect = movableElement.getBoundingClientRect()
          const targetRect = targetElement.getBoundingClientRect()
          const movableBottomCenter = { x: movableRect.left + movableRect.width / 1.5, y: movableRect.bottom }
          const targetTopLeft = { x: targetRect.left, y: targetRect.top }
          const newLeft = parseFloat(movableElement.style.left || '0') + (targetTopLeft.x - movableBottomCenter.x)
          const newTop = parseFloat(movableElement.style.top || '0') + (targetTopLeft.y - movableBottomCenter.y)

          movableElement.style.position = 'relative'
          movableElement.style.left = newLeft + 'px'
          movableElement.style.top = newTop + 'px'
        }
      })
    }

    //process bottom ones
    const bottomCausesGroup = document.querySelector<HTMLElement>(this.bottomCausesGroupSelector)
    if (bottomCausesGroup) {
      const bottomCausesContents = bottomCausesGroup.querySelectorAll<HTMLElement>(this.causeContentSelector)
      bottomCausesContents.forEach((element: HTMLElement) => {
        const movableElement = element.querySelector<HTMLElement>(this.bottomTitlesSelector)
        const targetElement = element.querySelector<HTMLElement>(this.diagonalLineSelector)
        if (movableElement && targetElement) {
          const movableRect = movableElement.getBoundingClientRect()
          const targetRect = targetElement.getBoundingClientRect()
          const movableTopCenter = { x: movableRect.left + movableRect.width / 1.5, y: movableRect.top,}
          const targetBottomLeft = { x: targetRect.left,  y: targetRect.bottom,}
          const newLeft = parseFloat(movableElement.style.left || '0') + (targetBottomLeft.x - movableTopCenter.x)
          const newTop = parseFloat(movableElement.style.top || '0') + (targetBottomLeft.y - movableTopCenter.y)

          // Apply the new position relative to the container
          movableElement.style.position = 'relative'
          movableElement.style.left = newLeft + 'px'
          movableElement.style.top = newTop + 'px'
        }
      })
    }
  }
}
