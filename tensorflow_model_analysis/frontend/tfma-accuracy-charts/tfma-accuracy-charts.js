/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {template} from './tfma-accuracy-charts-template.html.js';

import '@org_googlewebcomponents_google_chart/google-chart/google-chart.js';

/**
 * tfma-accuracy-charts renders accuracy precision, recall and F1 Score in one
 * plot.
 *
 * @polymer
 */
export class AccuracyPrecisionRecallF1 extends PolymerElement {
  constructor() {
    super();
  }

  static get is() {
    return 'tfma-accuracy-charts';
  }

  /** @return {!HTMLTemplateElement} */
  static get template() {
    return template;
  }

  /** @return {!PolymerElementProperties} */
  static get properties() {
    return {
      /** @type {!Array<!Object>} */

      data: {type: Array},

      /**
       * Chart rendering options.
       * @type {!Object}
       * @private
       */
      options_: {
        type: Object,
        value: {
          'legend': {'textStyle': {'fontSize': 9}},
          'hAxis': {'title': 'Thresholds'},
          'vAxis': {'title': 'Accuracy / Precision / Recall / F1'},
          'explorer':
              {actions: ['dragToPan', 'scrollToZoom', 'rightClickToReset']},
        }
      },

      /**
       * The data to be plotted in the line chart.
       * @private {!Array<!Array<string|number>>}
       */
      plotData_: {type: Array, computed: 'computePlotData_(data)'},
    };
  }

  /**
   * @param {!Array<!Object>} data
   * @return {!Array<!Array<string|number>>} A 2d array representing the data
   *     that will be visualized.
   * @private
   */
  computePlotData_(data) {
    const plotData = [[
      'Threshold', 'Accuracy', {'type': 'string', 'role': 'tooltip'},
      'Precision', {'type': 'string', 'role': 'tooltip'}, 'Recall',
      {'type': 'string', 'role': 'tooltip'}, 'F1',
      {'type': 'string', 'role': 'tooltip'}
    ]];
    data.forEach((entry) => {
      const threshold = Math.max(0, Math.min(1, entry['threshold'] || 0));
      // Due to potential division by zero, precision and recall can be NaN or
      // Infinity. These values are cannot be serialized as valid json. To
      // handle these cases, assume NaN and Infinity are converted to strings,
      // "NaN" and "Infinity" and use parseFloat to get back to NaN and
      // Infinity.
      const accuracy = parseFloat(
          tfma.CellRenderer.extractFloatValue(entry, 'accuracy') || 0);
      const recall =
          parseFloat(tfma.CellRenderer.extractFloatValue(entry, 'recall') || 0);
      const precision = parseFloat(
          tfma.CellRenderer.extractFloatValue(entry, 'precision') || 0);
      const f1 = 2 * recall * precision / (recall + precision);

      const makeTooltip = (name, value) => name + ': ' + value.toFixed(5) +
          ', threshold: ' + threshold.toFixed(5);

      plotData.push([
        threshold, accuracy, makeTooltip('Accuracy', accuracy), precision,
        makeTooltip('Precision', precision), recall,
        makeTooltip('Recall', recall), f1, makeTooltip('F1 Score', f1)
      ]);
    });
    return plotData;
  }
}

customElements.define('tfma-accuracy-charts', AccuracyPrecisionRecallF1);
