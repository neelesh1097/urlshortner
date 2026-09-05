import { generateNanoid } from "../utils/helper.js";
import urlSchema from "../models/shorturl.model.js";

export const shortUrlService = async (url) => {
    try {
        const shortUrl = generateNanoid(7)
        const newUrl = new urlSchema({
            full_url: url,
            short_url: shortUrl
        })
        newUrl.save()
        console.log(url);
        return shortUrl;

    } catch (error) {

    }
}