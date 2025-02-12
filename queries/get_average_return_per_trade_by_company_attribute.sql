CREATE OR REPLACE FUNCTION public.get_average_return_per_trade_by_company_attribute(_attribute text, _exclude_tickers text[] DEFAULT '{}'::text[], _included_strategies text[] DEFAULT '{}'::text[])
 RETURNS TABLE(analysis_type analysis_type, closing_strategy_id integer, closing_strategy_name text, attribute_value text, average_return numeric, average_percentage numeric, best_stock text, best_stock_avg_percent numeric, worst_stock text, worst_stock_avg_percent numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF _attribute = 'volatility' THEN
      RETURN QUERY
      WITH ticker_perf AS (
          SELECT 
             a.analysis_type,
             cs.id AS closing_strategy_id,
             cs.name AS closing_strategy_name,
             comp.volatility::text AS attribute_value,
             comp.ticker,
             AVG(p.value * (a.percentage/100.0)) AS average_return,
             AVG(a.percentage) AS average_percentage
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
          SELECT 
             tp.analysis_type,
             tp.closing_strategy_id,
             tp.closing_strategy_name,
             tp.attribute_value,
             AVG(tp.average_return) AS average_return,
             AVG(tp.average_percentage) AS average_percentage
          FROM ticker_perf tp
          GROUP BY tp.analysis_type, tp.closing_strategy_id, tp.closing_strategy_name, tp.attribute_value
      ),
      best_ranks AS (
          SELECT 
             tp.*,
             ROW_NUMBER() OVER (
                 PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value
                 ORDER BY tp.average_percentage DESC, tp.ticker ASC
             ) AS rn_best
          FROM ticker_perf tp
      ),
      worst_ranks AS (
          SELECT 
             tp.*,
             ROW_NUMBER() OVER (
                 PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value
                 ORDER BY tp.average_percentage ASC, tp.ticker ASC
             ) AS rn_worst
          FROM ticker_perf tp
      )
      SELECT 
          gp.analysis_type,
          gp.closing_strategy_id,
          gp.closing_strategy_name::text AS closing_strategy_name,
          gp.attribute_value,
          ROUND(gp.average_return, 2) AS average_return,
          ROUND(gp.average_percentage, 2) AS average_percentage,
          br.ticker AS best_stock,
          ROUND(br.average_percentage, 2) AS best_stock_avg_percent,
          wr.ticker AS worst_stock,
          ROUND(wr.average_percentage, 2) AS worst_stock_avg_percent
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
             AVG(p.value * (a.percentage/100.0)) AS average_return,
             AVG(a.percentage) AS average_percentage
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
             AVG(tp.average_return) AS average_return,
             AVG(tp.average_percentage) AS average_percentage
          FROM ticker_perf tp
          GROUP BY tp.analysis_type, tp.closing_strategy_id, tp.closing_strategy_name, tp.attribute_value
      ),
      best_ranks AS (
          SELECT 
             tp.*,
             ROW_NUMBER() OVER (
                 PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value
                 ORDER BY tp.average_percentage DESC, tp.ticker ASC
             ) AS rn_best
          FROM ticker_perf tp
      ),
      worst_ranks AS (
          SELECT 
             tp.*,
             ROW_NUMBER() OVER (
                 PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value
                 ORDER BY tp.average_percentage ASC, tp.ticker ASC
             ) AS rn_worst
          FROM ticker_perf tp
      )
      SELECT 
          gp.analysis_type,
          gp.closing_strategy_id,
          gp.closing_strategy_name::text AS closing_strategy_name,
          gp.attribute_value,
          ROUND(gp.average_return, 2) AS average_return,
          ROUND(gp.average_percentage, 2) AS average_percentage,
          br.ticker AS best_stock,
          ROUND(br.average_percentage, 2) AS best_stock_avg_percent,
          wr.ticker AS worst_stock,
          ROUND(wr.average_percentage, 2) AS worst_stock_avg_percent
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
             AVG(p.value * (a.percentage/100.0)) AS average_return,
             AVG(a.percentage) AS average_percentage
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
             AVG(tp.average_return) AS average_return,
             AVG(tp.average_percentage) AS average_percentage
          FROM ticker_perf tp
          GROUP BY tp.analysis_type, tp.closing_strategy_id, tp.closing_strategy_name, tp.attribute_value
      ),
      best_ranks AS (
          SELECT 
             tp.*,
             ROW_NUMBER() OVER (
                 PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value
                 ORDER BY tp.average_percentage DESC, tp.ticker ASC
             ) AS rn_best
          FROM ticker_perf tp
      ),
      worst_ranks AS (
          SELECT 
             tp.*,
             ROW_NUMBER() OVER (
                 PARTITION BY tp.analysis_type, tp.closing_strategy_id, tp.attribute_value
                 ORDER BY tp.average_percentage ASC, tp.ticker ASC
             ) AS rn_worst
          FROM ticker_perf tp
      )
      SELECT 
          gp.analysis_type,
          gp.closing_strategy_id,
          gp.closing_strategy_name::text AS closing_strategy_name,
          gp.attribute_value,
          ROUND(gp.average_return, 2) AS average_return,
          ROUND(gp.average_percentage, 2) AS average_percentage,
          br.ticker AS best_stock,
          ROUND(br.average_percentage, 2) AS best_stock_avg_percent,
          wr.ticker AS worst_stock,
          ROUND(wr.average_percentage, 2) AS worst_stock_avg_percent
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
