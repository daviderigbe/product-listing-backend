"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const spec = yamljs_1.default.load('openapi.yaml');
router.use('/', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(spec));
exports.default = router;
