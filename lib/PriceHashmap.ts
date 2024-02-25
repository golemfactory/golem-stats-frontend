import { RoundingFunction } from "./RoundingFunction"

type Data = {
    "golem.com.pricing.model.linear.coeffs": number[]
    "golem.com.usage.vector": string[]
}

export const PriceHashmap = (data: Data | null, usage: string) => {
    if (!data || !data["golem.com.usage.vector"] || !data["golem.com.pricing.model.linear.coeffs"]) {
        // Handle the case where data or its properties are null or undefined
        console.error("Invalid or missing data")
        return null // or throw an error, depending on your error handling strategy
    }

    const pricingMap: { [key: string]: number } = {}

    data["golem.com.usage.vector"].forEach((vector, index) => {
        if (index < data["golem.com.pricing.model.linear.coeffs"].length - 1) {
            pricingMap[vector] = data["golem.com.pricing.model.linear.coeffs"][index] * 3600
        } else {
            pricingMap[vector] = data["golem.com.pricing.model.linear.coeffs"][index]
        }
    })

    return RoundingFunction(pricingMap[usage], 10)
}
