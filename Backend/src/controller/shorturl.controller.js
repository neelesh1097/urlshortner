import { shortUrlService } from "../services/shorturl.service.js";

export const createShortUrl = async (req, res) => {
    const { url } = req.body;
    const shorturl = await shortUrlService(url);

    console.log(process.env.APP_URL + shorturl);
    res.send(process.env.APP_URL + shorturl);
}
