// ─── Types ───────────────────────────────────────────────────────────────────

import { Attribute, CustomFields, Product, ProductVariant } from "@commercetools/platform-sdk"
import { fetchCustomObjects, fetchInventory } from "./commercetools-api"

export type Status = "valid" | "warning" | "missing"

export interface DependencyCheck {
  label: string
  status: Status
  description: string
}

export interface ProductSellability {
  product: Product
  overallStatus: Status
  productSetup: DependencyCheck[]
  commerceSetup: DependencyCheck[]
  checkoutFlow: DependencyCheck[]
}

// ─── Helper: get display name ────────────────────────────────────────────────

export function getProductName(product: Product): string {
  const name = product.masterData.current.name
  return name["en-US"] || name["th-TH"] || product.key as string
}

export function getProductDisplayName(product: Product): string {
  const name = product.masterData.current.name
  const displayName = name["en-US"] || name["th-TH"] || product.key as string
  return product.productType.obj?.name + " : " + displayName
}

export function getProductAttribute(product: Product, attrName: string) {
  return product.masterData?.current?.masterVariant?.attributes.find((a) => a.name === attrName)?.value
}

// ─── Helper functions ────────────────────────────────────────────────────────

export function getProductSellability(product: Product): ProductSellability | null {
  if (!product) return null

  // const productType = product.productTypeId
  //   ? productTypes.find((pt) => pt.id === product.productTypeId)
  //   : null
  // const hasCategories = product.categoryIds.length > 0
  // const categoryNames = product.categoryIds
  //   .map((cid) => categories.find((c) => c.id === cid))
  //   .filter(Boolean)
  //   .map((c) => c!.name)
  // const price = prices.find((p) => p.productId === productId)
  // const inventory = inventories.find((i) => i.productId === productId)
  // const store = stores.find((s) => s.productIds.includes(productId))
  // const selection = productSelections.find((ps) => ps.productIds.includes(productId))
  // const cartVal = cartValidations.find((cv) => cv.productId === productId)
  // const orderVal = orderValidations.find((ov) => ov.productId === productId)

  // const hasTaxCategory = !!product.taxCategoryId

  const productSetup: DependencyCheck[] = [
    // {
    //   label: "Product Type configured",
    //   status: productType ? "valid" : "missing",
    //   description: productType
    //     ? `Assigned to "${productType.name}" (${productType.key})`
    //     : "No product type assigned. Required for attribute definitions.",
    // },
    // {
    //   label: "Category assigned",
    //   status: hasCategories ? "valid" : "warning",
    //   description: hasCategories
    //     ? `Assigned to: ${categoryNames.join(", ")}`
    //     : "No category assigned. Product won't appear in category navigation.",
    // },
    // {
    //   label: "Tax Category assigned",
    //   status: hasTaxCategory ? "valid" : "missing",
    //   description: hasTaxCategory
    //     ? `Tax category: ${product.taxCategoryId}`
    //     : "No tax category. Required for tax calculation at checkout.",
    // },
    {
      label: "Product published",
      status: product.masterData?.published ? "valid" : "missing",
      description: product.masterData?.published
        ? product.masterData?.hasStagedChanges
          ? "Published, but has unpublished staged changes."
          : "Published and up to date."
        : "Product is in draft state. Must be published to be visible.",
    },
    // {
    //   label: "Variant prices exist",
    //   status: product.masterVariant.prices.length > 0 || price ? "valid" : "missing",
    //   description:
    //     product.masterVariant.prices.length > 0
    //       ? `${product.masterVariant.prices.length} embedded price(s) on master variant`
    //       : price
    //         ? `Standalone price: ${(price.value / 100).toFixed(2)} ${price.currency}`
    //         : "No prices on master variant and no standalone price. Product cannot be purchased.",
    // },
  ]

  const commerceSetup: DependencyCheck[] = [
    // {
    //   label: "Inventory available",
    //   status: inventory
    //     ? inventory.availableQuantity > 0
    //       ? "valid"
    //       : "warning"
    //     : "missing",
    //   description: inventory
    //     ? inventory.availableQuantity > 0
    //       ? `${inventory.availableQuantity.toLocaleString()} available of ${inventory.quantity.toLocaleString()} total (SKU: ${inventory.sku})`
    //       : `Inventory exists but available quantity is 0 (SKU: ${inventory.sku}).`
    //     : "No inventory entry found. Cannot track availability.",
    // },
    // {
    //   label: "Store assigned",
    //   status: store ? "valid" : "missing",
    //   description: store
    //     ? `Available in "${store.name}" (${store.key})`
    //     : "Not assigned to any store. Product won't be available for purchase.",
    // },
    // {
    //   label: "Product Selection configured",
    //   status: selection ? "valid" : "missing",
    //   description: selection
    //     ? `Part of "${selection.name}" (${selection.key})`
    //     : "Not included in any product selection.",
    // },
  ]

  const checkoutFlow: DependencyCheck[] = [
    // {
    //   label: "Can be added to cart",
    //   status: cartVal?.canAddToCart ? "valid" : "missing",
    //   description: cartVal?.canAddToCart
    //     ? "All cart prerequisites are met."
    //     : cartVal?.reason || "Cart validation failed.",
    // },
    // {
    //   label: "Can create order",
    //   status: orderVal?.canCreateOrder ? "valid" : "missing",
    //   description: orderVal?.canCreateOrder
    //     ? "All order prerequisites are met."
    //     : orderVal?.reason || "Order validation failed.",
    // },
  ]

  const allChecks = [...productSetup, ...commerceSetup, ...checkoutFlow]
  const hasMissing = allChecks.some((c) => c.status === "missing")
  const hasWarning = allChecks.some((c) => c.status === "warning")

  return {
    product,
    overallStatus: hasMissing ? "missing" : hasWarning ? "warning" : "valid",
    productSetup,
    commerceSetup,
    checkoutFlow,
  }
}

// ─── Graph data builder ──────────────────────────────────────────────────────

export enum ProductType {
  Product = "Product",
  ProductMasterVariant = "ProductMasterVariant",
  ProductVariant = "ProductVariant",
  Inventory = "Inventory",
  CustomObject = "CustomObject",
  CustomObjectPromotionDetail = "CustomObjectPromotionDetail",
  CustomObjectPromotionProduct = "CustomObjectPromotionProduct",
  CustomObjectPromotionProductGroup = "CustomObjectPromotionProductGroup",
}

export interface GraphNode {
  uuid?: string
  id: string
  type: ProductType
  label: string
  status: Status
  detail: string | object
  product?: Product
  variant?: ProductVariant
  attributes?: Attribute[]
  custom?: CustomFields
  customObjectValue?: object
}

export interface GraphEdge {
  source: string
  target: string
}

export async function getProductGraphData(product: Product): Promise<{
  nodes: GraphNode[]
  edges: GraphEdge[]
}> {
  if (!product) return { nodes: [], edges: [] }

  const productId = product.id
  // const productType = product.productTypeId
  //   ? productTypes.find((pt) => pt.id === product.productTypeId)
  //   : null
  // const hasCategories = product.categoryIds.length > 0
  // const categoryNames = product.categoryIds
  //   .map((cid) => categories.find((c) => c.id === cid))
  //   .filter(Boolean)
  //   .map((c) => c!.name)
  // const price = prices.find((p) => p.productId === productId)
  // // const inventory = inventories.find((i) => i.productId === productId)
  // const store = stores.find((s) => s.productIds.includes(productId))
  // const selection = productSelections.find((ps) => ps.productIds.includes(productId))
  // const cartVal = cartValidations.find((cv) => cv.productId === productId)
  // const orderVal = orderValidations.find((ov) => ov.productId === productId)

  const displayName = getProductDisplayName(product)
  // const campaignCode = getProductAttribute(product, "campaignCode") as string | undefined

  const skus: string[] = []

  if (product.masterData?.current.masterVariant) {
    skus.push(product.masterData.current.masterVariant.sku!)
  }

  product.masterData?.current.variants.forEach((variant) => {
    skus.push(variant.sku!)
  })

  const inventoryResponse = await fetchInventory({ sku: skus })

  // console.log('inventoryResponse --> ', inventoryResponse);
  // const inventory = inventoryResponse.results.find((i) => i.sku === skus[0])

  const productType = product.productType?.obj?.key
  // console.log('productType --> ', productType);  

  const nodes: GraphNode[] = [
    {
      uuid: productId,
      id: `product-${productId}`,
      type: ProductType.Product,
      label: displayName,
      status: product.masterData?.published ? "valid" : "warning",
      detail: product.masterData?.published
        ? product.masterData?.hasStagedChanges
          ? `Published (staged changes) | Key: ${product.key}`
          : `Published | Key: ${product.key}`
        : `Draft | Key: ${product.key}`,
      product: product,
      attributes: product.masterData?.current?.masterVariant?.attributes,
    },
    {
      uuid: productId,
      id: `productMasterVariant-${productId}`,
      type: ProductType.ProductMasterVariant,
      label: product.masterData?.current.masterVariant.sku || "Missing",
      status: product.masterData?.current.masterVariant.sku ? "valid" : "missing",
      detail: product.masterData?.current.masterVariant.sku ? `${product.masterData.current.masterVariant.sku}` : "No master variant assigned",
      product: product,
      variant: product.masterData?.current.masterVariant,
      attributes: product.masterData?.current?.masterVariant?.attributes,
    },
  ]

  const edges: GraphEdge[] = [
    // { source: `product-${productId}`, target: `productType-${productId}` },
    { source: `product-${productId}`, target: `productMasterVariant-${productId}` },
    // { source: `product-${productId}`, target: `category-${productId}` },
    // { source: `product-${productId}`, target: `price-${productId}` },
    // { source: `price-${productId}`, target: `inventory-${productId}` },
    // { source: `inventory-${productId}`, target: `store-${productId}` },
  ]

  const masterVariantSku = product.masterData?.current.masterVariant.sku
  const inventory = inventoryResponse.results.find((i) => i.sku === masterVariantSku)
  if (inventory) {
    nodes.push({
      uuid: inventory.id,
      id: `inventory-${productId}-${masterVariantSku}`,
      type: ProductType.Inventory,
      label: inventory.key || inventory.sku,
      status: inventory.availableQuantity > 0 ? "valid" : "missing",
      detail: {
        sku: inventory.sku,
        key: inventory.key,
        availableQuantity: inventory.availableQuantity,
        quantityOnStock: inventory.quantityOnStock, 
        minCartQuantity: inventory.minCartQuantity,
        maxCartQuantity: inventory.maxCartQuantity,
        restockableInDays: inventory.restockableInDays,
        expectedDelivery: inventory.expectedDelivery
      },
      custom: inventory.custom
    })

    edges.push({ source: `productMasterVariant-${productId}`, target: `inventory-${productId}-${masterVariantSku}` })
  }


  product.masterData?.current.variants.forEach((variant) => {
    const nodeId = `variant-${productId}-${variant.sku}`
    nodes.push({
      uuid: productId,
      id: nodeId,
      type: ProductType.ProductVariant,
      label: variant.sku ?? "missing",
      status: "valid",
      detail: `SKU: ${variant.sku ?? "missing"} | Price: ${variant.price}`,
      product: product,
      variant: variant,
      attributes: variant.attributes,
    })

    edges.push({ source: `product-${productId}`, target: nodeId })

    const inventory = inventoryResponse.results.find((i) => i.sku === variant.sku)
    if (inventory) {
      nodes.push({
        uuid: inventory.id,
        id: `inventory-${productId}-${variant.sku}`,
        type: ProductType.Inventory,
        label: inventory.key || inventory.sku,
        status: inventory.availableQuantity > 0 ? "valid" : "missing",
        detail: {
          sku: inventory.sku,
          key: inventory.key,
          availableQuantity: inventory.availableQuantity,
          quantityOnStock: inventory.quantityOnStock, 
          minCartQuantity: inventory.minCartQuantity,
          maxCartQuantity: inventory.maxCartQuantity,
          restockableInDays: inventory.restockableInDays,
          expectedDelivery: inventory.expectedDelivery
        },
        custom: inventory.custom
      })

      edges.push({ source: nodeId, target: `inventory-${productId}-${variant.sku}` })
    }
  })

  if (productType === 'promotion_set') {
    const promotionDetails = getProductAttribute(product, "promotionDetails") as string[]

    for (const promotionDetailKey of promotionDetails) {
      const customObjects = await fetchCustomObjects({ container: 'promotion_product_detail', key: promotionDetailKey })
      if (customObjects.results.length > 0) {
        const promotionDetail = customObjects.results[0]
        nodes.push({
          uuid: promotionDetail.id,
          id: `customObject-promotionDetail-${promotionDetailKey}`,
          type: ProductType.CustomObjectPromotionDetail,
          label: promotionDetail.value?.code,
          status: "valid",
          detail: `Key: ${promotionDetail.key}`,
          customObjectValue: promotionDetail.value
        })

        edges.push({ source: `productMasterVariant-${productId}`, target: `customObject-promotionDetail-${promotionDetailKey}` })
      }

    }

    const promotionProducts = getProductAttribute(product, "promotionProducts")

    for (const promotionProductKey of promotionProducts) {
      const customObjects = await fetchCustomObjects({ container: 'promotion_product', key: promotionProductKey })

      if (customObjects.results.length > 0) {
        const promotionProduct = customObjects.results[0]
        nodes.push({
          uuid: promotionProduct.id,
          id: `customObject-promotionProduct-${promotionProductKey}`,
          type: ProductType.CustomObjectPromotionProduct,
          label: promotionProduct.value?.code,
          status: "valid",
          detail: `Key: ${promotionProduct.key}`,
          customObjectValue: promotionProduct.value
        })

        edges.push({ source: `productMasterVariant-${productId}`, target: `customObject-promotionProduct-${promotionProductKey}` })
      }
    }

    const promotionProductGroups = getProductAttribute(product, "promotionProductGroups")
    for (const promotionProductGroupKey of promotionProductGroups) {
      const customObjects = await fetchCustomObjects({ container: 'promotion_product_group', key: promotionProductGroupKey })
      if (customObjects.results.length > 0) {
        const promotionProductGroup = customObjects.results[0]
        nodes.push({
          uuid: promotionProductGroup.id,
          id: `customObject-promotionProductGroup-${promotionProductGroupKey}`,
          type: ProductType.CustomObjectPromotionProductGroup,
          label: promotionProductGroup.value?.code,
          status: "valid",
          detail: `Key: ${promotionProductGroup.key}`,
          customObjectValue: promotionProductGroup.value
        })

        edges.push({ source: `productMasterVariant-${productId}`, target: `customObject-promotionProductGroup-${promotionProductGroupKey}` })
      }
    }

    // const promotionSetVariants = getProductAttribute(product, "variants")
    // console.log('promotionSetVariants --> ', promotionSetVariants);
  }

  return { nodes, edges }
}
