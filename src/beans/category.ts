import {Category as YnabCategory} from 'ynab';
import {fromNullable, Option} from '../util/option';

export interface CategoryGroupData {
  id?: string;
  name?: string;
  categories: Array<CategoryData>;
}

export class CategoryGroupSaveObject {
  readonly id?: string;
  readonly name?: string;
  readonly categoryIds: string[];

  constructor(obj: {id?: string, name?: string, categoryIds: string[]}) {
    this.id = obj.id;
    this.name = obj.name;
    this.categoryIds = obj.categoryIds.slice();
  }

  toSheetsArray(): any[] {
    return [this.id, this.name];
  }

  static fromSheetsArray(row: any[]) {
    return new CategoryGroupSaveObject({
      id: row[0],
      name: row[1],
      categoryIds: [],
    });
  }
}

export class CategoryGroup {
  categories: Category[];

  constructor(readonly group: CategoryGroupData) {
    this.categories = group.categories.map(c => new Category(c));
  }

  get name() {
    return this.group.name;
  }

  get id() {
    return this.group.id;
  }

  toAspire(): any[][] {
    return [['✦', this.name], this.categories.map(c => c.toSheetsArray())];
  }

  toSheetsArray(): any[][] {
    // return [['✦', this.name], this.categories.map(c => c.toSheetsArray())];
    return this.categories.map(c => c.toSheetsArray());
  }

  static fromSheetsArray(row: any[]): CategoryGroup {
    return new CategoryGroup({
      id: row[0],
      name: row[1],
      categories: [],
    });
  }

  toSaveObject() {
    return new CategoryGroupSaveObject({
      id: this.id,
      name: this.name,
      categoryIds: this.categories.map(c => c.id),
    });
  }
}

export interface CategoryData extends GoalData {
  id: string;
  name: string;
  group_id?: string;
  budgeted: number;
  activity: number;
  balance: number;
}

export class Category {
  readonly goal: Goal;

  constructor(readonly category: CategoryData) {
    this.goal = new Goal(category);
  }

  get name() {
    return this.category.name;
  }

  get group_id() {
    return this.category.group_id;
  }

  set group_id(group_id: string|undefined) {
    this.category.group_id = group_id;
  }

  get id() {
    return this.category.id;
  }

  get budgeted() {
    // Get dollars
    return this.category.budgeted / 1000;
  }

  get balance() {
    // Get dollars
    return this.category.balance / 1000;
  }

  get activity() {
    // Get dollars
    return this.category.activity / 1000;
  }

  toAspire(): any[] {
    return ['✧', this.name, 0];
  }

  toSheetsArray(): any[] {
    return [
      this.group_id, this.id, this.name, this.budgeted, this.activity,
      this.balance
    ];
  }

  static fromSheetsArray(row: any[]): Category {
    return new Category({
      id: row[0] as string,
      name: row[1] as string,
      budgeted: (row[2] as number) * 1000,
      activity: (row[3] as number) * 1000,
      balance: (row[4] as number) * 1000,
    });
  }
}

export interface GoalData {
  goal_type?: YnabCategory.GoalTypeEnum|null;
  goal_creation_month?: string|null;
  goal_target?: number|null;
  goal_target_month?: string|null;
  goal_percentage_complete?: number|null;
}

export class Goal {
  readonly goal_type: Option<YnabCategory.GoalTypeEnum>;
  readonly goal_creation_month: Option<string>;
  readonly goal_target: Option<number>;
  readonly goal_target_month: Option<string>;
  readonly goal_percentage_complete: Option<number>;

  constructor(goal: GoalData) {
    this.goal_type = fromNullable(goal.goal_type);
    this.goal_creation_month = fromNullable(goal.goal_creation_month);
    this.goal_target = fromNullable(goal.goal_target);
    this.goal_target_month = fromNullable(goal.goal_target_month);
    this.goal_percentage_complete = fromNullable(goal.goal_percentage_complete);
  }
}

/*
class TargetBalanceGoal implements Goal {
  constructor(goal: GoalData) {
    this.goal_creation_month = fromNullable(goal.goal_creation_month);
    this.goal_target = fromNullable(goal.goal_target);
    this.goal_target_month = fromNullable(goal.goal_target_month);
    this.goal_percentage_complete = fromNullable(goal.goal_percentage_complete);
  }
}
class TargetBalanceByDateGoal implements Goal {}
class MonthlyFundingGoal implements Goal {}
class SpendingGoal implements Goal {}
 */
