CREATE OR REPLACE FUNCTION public.get_profit_loss_ratio_by_company_attribute(_attribute text, _exclude_tickers text[] DEFAULT '{}'::text[], _included_strategies text[] DEFAULT '{}'::text[])
 RETURNS TABLE(analysis_type analysis_type, closing_strategy_id integer, closing_strategy_name text, attribute_value text, avg_win numeric, avg_loss numeric, profit_loss_ratio numeric, best_stock text, best_stock_pl_ratio numeric, worst_stock text, worst_stock_pl_ratio numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF _attribute = 'volatility' THEN
        RETURN QUERY
        WITH ticker_perf AS (
          -- Ticker-level profit/loss calculations:
          SELECT 
            a.analysis_type,
            cs.id AS closing_strategy_id,
            cs.name AS closing_strategy_name,
            comp.volatility::text AS attribute_value,
            comp.ticker,
            AVG(CASE WHEN a.result = 'WIN' THEN a.percentage END) AS avg_win,
            ABS(AVG(CASE WHEN a.result = 'LOSS' THEN a.percentage END)) AS avg_loss,
            CASE 
              WHEN ABS(AVG(CASE WHEN a.result = 'LOSS' THEN a.percentage END)) = 0 THEN NULL
              ELSE AVG(CASE WHEN a.result = 'WIN' THEN a.percentage END) /
                   ABS(AVG(CASE WHEN a.result = 'LOSS' THEN a.percentage END))
            END AS profit_loss_ratio
          FROM analysis a
          JOIN actions act ON a.fk_action = act.id
          JOIN prices p ON act.fk_price = p.id
          JOIN closing_strategy cs ON a.fk_closing_strategy = cs.id
          JOIN companies comp ON p.fk_company = comp.ticker
          WHERE NOT (p.fk_company = ANY(_exclude_tickers))
            AND cs.name = ANY(_included_strategies)
          GROUP BY a.analysis_type, cs.id, cs.name, comp.volatility, comp.ticker
        ),
        group_perf AS (
          -- Group-level aggregation: average the ticker-level values
          SELECT 
            tp.analysis_type,
            tp.closing_strategy_id,
            tp.closing_strategy_name,
            tp.attribute_value,
            AVG(tp.avg_win) AS avg_win,
            AVG(tp.avg_loss) AS avg_loss,
            CASE 
              WHEN AVG(tp.avg_loss) = 0 THEN NULL
              ELSE AVG(tp.avg_win) / AVG(tp.avg_loss)
            END AS profit_loss_ratio
          FROM ticker_perf tp
          GROUP BY tp.analysis_type, tp.closing_strategy_id, tp.closing_strategy_name, tp.attribute_value
        ),
        best_ranks AS (
          -- Rank tickers by profit_loss_ratio descending (best first)
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.profit_loss_ratio DESC, tp.ticker ASC
            ) AS rn_best
          FROM ticker_perf tp
        ),
        worst_ranks AS (
          -- Rank tickers by profit_loss_ratio ascending (worst first)
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.profit_loss_ratio ASC, tp.ticker ASC
            ) AS rn_worst
          FROM ticker_perf tp
        )
        SELECT 
          gp.analysis_type,
          gp.closing_strategy_id,
          gp.closing_strategy_name::text AS closing_strategy_name,
          gp.attribute_value,
          gp.avg_win,
          gp.avg_loss,
          gp.profit_loss_ratio,
          br.ticker AS best_stock,
          br.profit_loss_ratio AS best_stock_pl_ratio,
          wr.ticker AS worst_stock,
          wr.profit_loss_ratio AS worst_stock_pl_ratio
        FROM group_perf gp
        LEFT JOIN best_ranks br 
          ON gp.analysis_type = br.analysis_type
          AND gp.closing_strategy_id = br.closing_strategy_id
          AND gp.attribute_value = br.attribute_value
          AND br.rn_best = 1
        LEFT JOIN worst_ranks wr 
          ON gp.analysis_type = wr.analysis_type
          AND gp.closing_strategy_id = wr.closing_strategy_id
          AND gp.attribute_value = wr.attribute_value
          AND wr.rn_worst = 1;
          
    ELSIF _attribute = 'size' THEN
        RETURN QUERY
        WITH ticker_perf AS (
          SELECT 
            a.analysis_type,
            cs.id AS closing_strategy_id,
            cs.name AS closing_strategy_name,
            comp.size::text AS attribute_value,
            comp.ticker,
            AVG(CASE WHEN a.result = 'WIN' THEN a.percentage END) AS avg_win,
            ABS(AVG(CASE WHEN a.result = 'LOSS' THEN a.percentage END)) AS avg_loss,
            CASE 
              WHEN ABS(AVG(CASE WHEN a.result = 'LOSS' THEN a.percentage END)) = 0 THEN NULL
              ELSE AVG(CASE WHEN a.result = 'WIN' THEN a.percentage END) /
                   ABS(AVG(CASE WHEN a.result = 'LOSS' THEN a.percentage END))
            END AS profit_loss_ratio
          FROM analysis a
          JOIN actions act ON a.fk_action = act.id
          JOIN prices p ON act.fk_price = p.id
          JOIN closing_strategy cs ON a.fk_closing_strategy = cs.id
          JOIN companies comp ON p.fk_company = comp.ticker
          WHERE NOT (p.fk_company = ANY(_exclude_tickers))
            AND cs.name = ANY(_included_strategies)
          GROUP BY a.analysis_type, cs.id, cs.name, comp.size, comp.ticker
        ),
        group_perf AS (
          SELECT 
            tp.analysis_type,
            tp.closing_strategy_id,
            tp.closing_strategy_name,
            tp.attribute_value,
            AVG(tp.avg_win) AS avg_win,
            AVG(tp.avg_loss) AS avg_loss,
            CASE 
              WHEN AVG(tp.avg_loss) = 0 THEN NULL
              ELSE AVG(tp.avg_win) / AVG(tp.avg_loss)
            END AS profit_loss_ratio
          FROM ticker_perf tp
          GROUP BY tp.analysis_type, tp.closing_strategy_id, tp.closing_strategy_name, tp.attribute_value
        ),
        best_ranks AS (
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.profit_loss_ratio DESC, tp.ticker ASC
            ) AS rn_best
          FROM ticker_perf tp
        ),
        worst_ranks AS (
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.profit_loss_ratio ASC, tp.ticker ASC
            ) AS rn_worst
          FROM ticker_perf tp
        )
        SELECT 
          gp.analysis_type,
          gp.closing_strategy_id,
          gp.closing_strategy_name::text AS closing_strategy_name,
          gp.attribute_value,
          gp.avg_win,
          gp.avg_loss,
          gp.profit_loss_ratio,
          br.ticker AS best_stock,
          br.profit_loss_ratio AS best_stock_pl_ratio,
          wr.ticker AS worst_stock,
          wr.profit_loss_ratio AS worst_stock_pl_ratio
        FROM group_perf gp
        LEFT JOIN best_ranks br 
          ON gp.analysis_type = br.analysis_type
          AND gp.closing_strategy_id = br.closing_strategy_id
          AND gp.attribute_value = br.attribute_value
          AND br.rn_best = 1
        LEFT JOIN worst_ranks wr 
          ON gp.analysis_type = wr.analysis_type
          AND gp.closing_strategy_id = wr.closing_strategy_id
          AND gp.attribute_value = wr.attribute_value
          AND wr.rn_worst = 1;
          
    ELSIF _attribute = 'sector' THEN
        RETURN QUERY
        WITH ticker_perf AS (
          SELECT 
            a.analysis_type,
            cs.id AS closing_strategy_id,
            cs.name AS closing_strategy_name,
            comp.sector::text AS attribute_value,
            comp.ticker,
            AVG(CASE WHEN a.result = 'WIN' THEN a.percentage END) AS avg_win,
            ABS(AVG(CASE WHEN a.result = 'LOSS' THEN a.percentage END)) AS avg_loss,
            CASE 
              WHEN ABS(AVG(CASE WHEN a.result = 'LOSS' THEN a.percentage END)) = 0 THEN NULL
              ELSE AVG(CASE WHEN a.result = 'WIN' THEN a.percentage END) /
                   ABS(AVG(CASE WHEN a.result = 'LOSS' THEN a.percentage END))
            END AS profit_loss_ratio
          FROM analysis a
          JOIN actions act ON a.fk_action = act.id
          JOIN prices p ON act.fk_price = p.id
          JOIN closing_strategy cs ON a.fk_closing_strategy = cs.id
          JOIN companies comp ON p.fk_company = comp.ticker
          WHERE NOT (p.fk_company = ANY(_exclude_tickers))
            AND cs.name = ANY(_included_strategies)
          GROUP BY a.analysis_type, cs.id, cs.name, comp.sector, comp.ticker
        ),
        group_perf AS (
          SELECT 
            tp.analysis_type,
            tp.closing_strategy_id,
            tp.closing_strategy_name,
            tp.attribute_value,
            AVG(tp.avg_win) AS avg_win,
            AVG(tp.avg_loss) AS avg_loss,
            CASE 
              WHEN AVG(tp.avg_loss) = 0 THEN NULL
              ELSE AVG(tp.avg_win) / AVG(tp.avg_loss)
            END AS profit_loss_ratio
          FROM ticker_perf tp
          GROUP BY tp.analysis_type, tp.closing_strategy_id, tp.closing_strategy_name, tp.attribute_value
        ),
        best_ranks AS (
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.profit_loss_ratio DESC, tp.ticker ASC
            ) AS rn_best
          FROM ticker_perf tp
        ),
        worst_ranks AS (
          SELECT 
            tp.*,
            ROW_NUMBER() OVER (
              PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value 
              ORDER BY tp.profit_loss_ratio ASC, tp.ticker ASC
            ) AS rn_worst
          FROM ticker_perf tp
        )
        SELECT 
          gp.analysis_type,
          gp.closing_strategy_id,
          gp.closing_strategy_name::text AS closing_strategy_name,
          gp.attribute_value,
          gp.avg_win,
          gp.avg_loss,
          gp.profit_loss_ratio,
          br.ticker AS best_stock,
          br.profit_loss_ratio AS best_stock_pl_ratio,
          wr.ticker AS worst_stock,
          wr.profit_loss_ratio AS worst_stock_pl_ratio
        FROM group_perf gp
        LEFT JOIN best_ranks br 
          ON gp.analysis_type = br.analysis_type
          AND gp.closing_strategy_id = br.closing_strategy_id
          AND gp.attribute_value = br.attribute_value
          AND br.rn_best = 1
        LEFT JOIN worst_ranks wr 
          ON gp.analysis_type = wr.analysis_type
          AND gp.closing_strategy_id = wr.closing_strategy_id
          AND gp.attribute_value = wr.attribute_value
          AND wr.rn_worst = 1;
          
    ELSE
        RAISE EXCEPTION 'Unknown attribute: %', _attribute;
    END IF;
END;
$function$
