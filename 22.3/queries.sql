-- Join the two tables so that every column and record appears, regardless of if there is not an
-- owner_id.
SELECT * FROM owners
    FULL OUTER JOIN vehicles
    ON owners.id = vehicles.owner_id
;

-- Count the number of cars for each owner. Display the owners first_name, last_name and count of
-- vehicles. The first_name should be ordered in ascending order.
SELECT first_name, last_name, COUNT(owner_id)
    FROM owners
    JOIN vehicles on owners.id = vehicles.owner_id
    GROUP BY (first_name, last_name)
    ORDER BY first_name
;

-- Count the number of cars for each owner and display the average price for each of the cars as
-- integers. Display the owners first_name, last_name, average price and count of vehicles. The
-- first_name should be ordered in descending order. Only display results with more than one
-- vehicle and an average price greater than 10000.
SELECT first_name, last_name, ROUND(AVG(PRICE)) as average_price, COUNT(owner_id) as num_owners
    FROM owners
    JOIN vehicles ON owners.id = vehicles.owner_id
    GROUP BY (first_name, last_name)
    HAVING num_owners> 1 AND average_price > 10000
    ORDER BY first_name DESC
;
