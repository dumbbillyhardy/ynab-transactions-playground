import {Transaction} from '../../beans/transaction';
import {ArbitraryDataChildStore} from '../../service/interfaces';
import {SheetRangeBuilder} from '../../sheet_range';
import {ChildDAO} from '../interfaces';


export class SheetsTransactionsDAO implements ChildDAO<Transaction> {
  constructor(
      readonly sheetsService: ArbitraryDataChildStore<Transaction>,
      readonly sheetRangeBuilder: SheetRangeBuilder) {
    this.sheetRangeBuilder.withSheetPrefix('Transactions');
  }

  getAllForParent(b_id: string): Promise<Transaction[]> {
    return this.sheetsService.getAllForParent(b_id);
  }

  getById(): Promise<Transaction> {
    throw new Error('Not implemented, try using cached service.');
  }

  save(b_id: string, transaction: Transaction): Promise<Transaction> {
    return this.sheetsService.save(b_id, transaction);
  }

  update(b_id: string, transaction: Transaction): Promise<Transaction> {
    return this.sheetsService.update(b_id, transaction);
  }

  delete(): Promise<Transaction> {
    throw new Error('Not implemented');
  }

  saveAll(b_id: string, transactions: Transaction[]): Promise<Transaction[]> {
    b_id;
    return this.sheetsService.saveAll(b_id, transactions);
  }
}
