/*
Copyright © 2020 NAME HERE <EMAIL ADDRESS>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
package cmd

import (
	"github.com/dariusbakunas/eve-processors/db"
	"github.com/dariusbakunas/eve-processors/esi"
	"github.com/dariusbakunas/eve-processors/processors"
	"github.com/joho/godotenv"
	"github.com/spf13/cobra"
	"log"
)

// marketCmd represents the market command
var marketCmd = &cobra.Command{
	Use:   "market",
	Short: "Update global market orders",
	Long: `Update global market orders`,
	Run: func(cmd *cobra.Command, args []string) {
		err := godotenv.Load("../.env")
		if err != nil {
			log.Fatal("Error loading .env file")
		}

		dao, err := db.InitializeDb()

		if err != nil {
			log.Fatalf("db.InitializeDb: %v", err)
		}

		client := esi.NewEsiClient("https://esi.evetech.net/latest")

		err = processors.ProcessMarketOrders(dao, client)

		if err != nil {
			log.Fatalf("processors.ProcessMarketOrders: %v", err)
		}
	},
}

func init() {
	rootCmd.AddCommand(marketCmd)
}
