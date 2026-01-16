import { Router } from 'express';
const router = Router();

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const spec = YAML.load('openapi.yaml');

router.use('/', swaggerUi.serve, swaggerUi.setup(spec));

export default router;

