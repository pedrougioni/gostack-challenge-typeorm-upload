import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const transacation = await transactionRepository.findOne(id);
    if (!transacation) {
      throw new AppError('This transaction no exits');
    }
    await transactionRepository.delete(id);
  }
}

export default DeleteTransactionService;
