
import { apiError } from "../utlisnew/apierror.js";
import { apiResponse } from "../utlisnew/apiResponse.js";
import  {asyncHandler} from "../utlisnew/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
    res.status(200).json({ status: "OK", message: "Healthcheck passed" });
});

export {
    healthcheck
};