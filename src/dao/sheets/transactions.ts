import {Transaction} from '../../beans/transaction';
import {SheetsService} from '../../service/sheets';
import {SheetRangeBuilder} from '../../sheet_range';
import {TransactionsDAO} from '../interface/transactions';


export class SheetsTransactionsDAO implements TransactionsDAO {
  constructor(
      readonly sheetsService: SheetsService<Transaction>,
      readonly sheetRangeBuilder: SheetRangeBuilder) {
    this.sheetRangeBuilder.withSheetPrefix('Transactions');
  }

  getAllInBudget(b_id: string): Promise<Transaction[]> {
    return this.sheetsService.getAllForParent(b_id);
  }

  getById(): Promise<Transaction> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(b_id: string, transaction: Transaction): Promise<Transaction> {
    return this.sheetsService.save(transaction.transaction, b_id);
  }

  update(): Promise<Transaction> {
    throw new Error('Not implemented');
  }

  delete(): Promise<Transaction> {
    throw new Error('Not implemented');
  }

  saveAll(b_id: string, transactions: Transaction[]): Promise<Transaction[]> {
    return this.sheetsService.saveAll(transactions, b_id);
  }
}
