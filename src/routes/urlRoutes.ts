import { Router } from 'express';
import { UrlController } from '../controllers/urlController';
import { AccessLogRepository } from '../repositories/accessLogRepository';
import { UrlRepository } from '../repositories/urlRepository';
import { StatsService } from '../services/statsService';
import { UrlService } from '../services/urlService';


const router = Router();

const urlRepository = new UrlRepository();
const accessLogRepository = new AccessLogRepository();
const urlService = new UrlService(urlRepository);
const statsService = new StatsService(urlRepository, accessLogRepository);
const urlController = new UrlController(urlService, statsService);

router.post('/urls', (req, res, next) => urlController.create(req, res, next));
router.get('/:code', (req, res, next) => urlController.redirect(req, res, next));
router.get('/urls/:code/stats', (req, res, next) => urlController.stats(req, res, next));

export default router;
