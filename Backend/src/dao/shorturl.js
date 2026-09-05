import urlSchema from "../models/shorturl.model.js";


export const saveShortUrl = async (url, shortUrl, userId) => {

    const newUrl = new urlSchema({
        full_url: url,
        short_url: shortUrl
    })

    if (userId) {
        newUrl.user = userId;
    }

    newUrl.save()
    console.log(url);
}


export const getShortUrl = async (shortUrl) => {
    return await urlSchema.findOneAndUpdate({ short_url: shortUrl }, { $inc: { clicks: 1 } });
}