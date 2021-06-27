import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';
import uploadConfig from '../config/upload';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionRepository.find({
    relations: ['category'],
  });
  const balance = await transactionRepository.getBalance();
  response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactionService = new CreateTransactionService();

  if (type !== 'income' && type !== 'outcome') {
    throw new AppError('Invalid transaction type');
  }

  const transaction = await createTransactionService.execute({
    title,
    category,
    type,
    value,
  });
  response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute({ id });
  response.json({ ok: true });
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;
    if (!file || file.mimetype !== 'text/csv') {
      throw new AppError('Missing csv file to import');
    }
    const importTransactionsService = new ImportTransactionsService();
    const transactions = await importTransactionsService.execute({
      fileName: file.filename,
    });
    response.json(transactions);
  },
);

export default transactionsRouter;
