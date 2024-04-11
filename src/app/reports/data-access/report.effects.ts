import { inject } from '@angular/core';

import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { forkJoin, mergeMap, of, switchMap } from 'rxjs';

import { selectRouteNestedParam } from '../../router.selectors';
import { YnabService } from '../../shared/services/ynab/ynab.service';
import { reportActions } from './report.actions';

export class ReportEffects {
  actions$ = inject(Actions);
  ynab = inject(YnabService);
  store = inject(Store);

  loadBudgetResources$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(reportActions.initReportData),
      concatLatestFrom(() => this.store.select(selectRouteNestedParam('id'))),
      mergeMap(([_action, id]) => {
        return forkJoin({
          categoryGroups: this.ynab.getCategoryGroups(id),
          accounts: this.ynab.getAccounts(id),
          transactions: this.ynab.getTransactions(id),
        });
      }),
      switchMap((data) => {
        return of(reportActions.setReportData(data));
      }),
    );
  });
}
