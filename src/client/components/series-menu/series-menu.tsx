/*
 * Copyright 2017-2018 Allegro.pl
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { Clicker } from "../../../common/models/clicker/clicker";
import { Essence } from "../../../common/models/essence/essence";
import { Series, SeriesFormat, SeriesPercents } from "../../../common/models/series/series";
import { Stage } from "../../../common/models/stage/stage";
import { Fn } from "../../../common/utils/general/general";
import { STRINGS } from "../../config/constants";
import { enterKey } from "../../utils/dom/dom";
import { BubbleMenu } from "../bubble-menu/bubble-menu";
import { Button } from "../button/button";
import { FormatPicker } from "./format-picker";
import { PercentsPicker } from "./percent-picker";
import "./series-menu.scss";

interface SeriesMenuProps {
  clicker: Clicker;
  essence: Essence;
  openOn: Element;
  containerStage: Stage;
  onClose: Fn;
  series: Series;
  inside?: Element;
}

interface SeriesMenuState {
  format: SeriesFormat;
  percents: SeriesPercents;
}

export class SeriesMenu extends React.Component<SeriesMenuProps, SeriesMenuState> {

  state: SeriesMenuState = { format: this.props.series.format, percents: this.props.series.percents };

  componentDidMount() {
    window.addEventListener("keydown", this.globalKeyDownListener);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.globalKeyDownListener);
  }

  globalKeyDownListener = (e: KeyboardEvent) => enterKey(e) && this.onOkClick();

  saveFormat = (format: SeriesFormat) => this.setState({ format });

  savePercents = (percents: SeriesPercents) => this.setState({ percents });

  onCancelClick = () => this.props.onClose();

  onOkClick = () => {
    if (!this.hasChanged()) return;
    const { series: originalSeries, clicker, essence, onClose } = this.props;
    const series = this.constructSeries();
    clicker.changeSeriesList(essence.series.replaceSeries(originalSeries, series));
    onClose();
  }

  hasChanged() {
    const series = this.constructSeries();
    return !this.props.series.equals(series);
  }

  private constructSeries() {
    const { series } = this.props;
    const { format, percents } = this.state;
    return series
      .set("format", format)
      .set("percents", percents);
  }

  render() {
    const { essence: { dataCube, splits }, containerStage, openOn, series, onClose, inside } = this.props;
    const measure = dataCube.getMeasure(series.reference);
    if (!measure) return null;

    const { percents, format } = this.state;
    const disabled = !this.hasChanged();

    return <BubbleMenu
      className="series-menu"
      direction="down"
      containerStage={containerStage}
      stage={Stage.fromSize(250, 240)}
      openOn={openOn}
      onClose={onClose}
      inside={inside}>
      <FormatPicker
        measure={measure}
        format={format}
        formatChange={this.saveFormat} />
      <PercentsPicker
        disabled={splits.length() === 0}
        percents={percents}
        percentsChange={this.savePercents} />
      <div className="button-bar">
        <Button className="ok" type="primary" disabled={disabled} onClick={this.onOkClick} title={STRINGS.ok} />
        <Button type="secondary" onClick={this.onCancelClick} title={STRINGS.cancel} />
      </div>
    </BubbleMenu>;
  }
}
