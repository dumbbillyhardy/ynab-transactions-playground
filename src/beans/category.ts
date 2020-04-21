import {Category as YnabCategory} from 'ynab';
import {fromNullable, Option} from '../util/option';

export interface CategoryGroupSaveObjectData {
  budget_id: string;
  id?: string;
  name?: string;
  categoryIds: string[];
}

export interface CategoryGroupData {
  budget_id: string;
  id?: string;
  name?: string;
  categories: Array<CategoryData>;
}

export class CategoryGroup {
  budget_id: string;
  id?: string;
  name?: string;
  categories: Category[];

  constructor(readonly group: CategoryGroupData) {
    this.budget_id = group.budget_id;
    this.id = group.id;
    this.name = group.name;
    this.categories = group.categories.map(c => new Category(c));
  }

  toAspire(): any[][] {
    return [['✦', this.name], this.categories.map(c => c.toSheetsArray())];
  }

  toSheetsArray(): any[] {
    return [this.budget_id, this.id, this.name];
  }

  static fromSheetsArray(row: any[]) {
    return new CategoryGroup({
      budget_id: row[0],
      id: row[1],
      name: row[2],
      categories: [],
    });
  }

  toYnabSaveObject(): CategoryGroupSaveObjectData {
    return {
      budget_id: this.budget_id,
      id: this.id,
      name: this.name,
      categoryIds: this.categories.map(c => c.id ?? ''),
    };
  }

  toSaveObject() {
    return {
      budget_id: this.budget_id,
      id: this.id,
      name: this.name,
      categories: this.categories.map(c => c.toSaveObject()),
    };
  }
}

export interface CategoryData extends GoalData {
  budget_id: string;
  id?: string;
  name?: string;
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

  get budget_id() {
    return this.category.budget_id;
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
      this.budget_id, this.group_id, this.id, this.name, this.budgeted,
      this.activity, this.balance
    ];
  }

  static fromSheetsArray(row: any[]): Category {
    return new Category({
      budget_id: row[0],
      id: row[1] as string,
      name: row[2] as string,
      budgeted: (row[3] as number) * 1000,
      activity: (row[4] as number) * 1000,
      balance: (row[5] as number) * 1000,
    });
  }

  toSaveObject() {
    return {
      budget_id: this.budget_id,
      id: this.id,
      name: this.name,
      budgeted: this.budgeted,
      activity: this.activity,
      balance: this.balance,
    };
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
